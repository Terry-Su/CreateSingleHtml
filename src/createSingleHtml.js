import 'babel-polyfill'

import $ from 'jquery'
import './util/fetch'

import { checkSameOrigin } from './util/index'
import asyncGetBase64 from './util/asyncGetBase64'
import visualLogger from './util/visualLogger'
import download from './util/download.js'
let self

window.UnitTest = window.UnitTest || {}
Object.assign(window.UnitTest, {
    checkSameOrigin
})




const createSingleHtml = {
    /**
     * rewrite href to full href
     * example: "<link href="./test.css" />" --> "<link href="http://domain/test.css" />"
     */
    rewriteHrefToFullHref() {
        const $hrefDoms = $('[href]')
        $hrefDoms.each((i, dom) => {
            const { href } = dom
            dom.href = href
        })
    },

    /**
     * rewrite src to full src
     * example: "<script src="/test.js"></script>" --> "<script src="http://doamin/test.js"></script>"
     */
    rewriteSrcToFullSrc() {
        const $srcDoms = $('[src]')
        $srcDoms.each((i, dom) => {
            const { src } = dom
            dom.src = src
        })
    },

    /**
     * rewrite CSS
     */
    rewriteCss() {
        // get css links
        const links = $('[href$="css"]').toArray().filter(link => checkSameOrigin(link.href))

        const linksPromises = links.map(link => {
            const { href } = link
            // get css's style text
            return new Promise(
                resolve => {
                    fetch(href)
                        .then(response => response.text())
                        .then(text => {
                            // replace "link" with "style"
                            // const style = document.createElement('style')
                            // style.innerHTML = text
                            // $(link).replaceWith(style)
                            link.remove()
                            $('head').append(`<style>${text}</style>`)
                            resolve()
                        })
                        .catch(err => {
                            visualLogger.show(err.toString())
                            resolve()
                        })
                }
            )
        })

        return Promise.all(linksPromises)
    },


    // rewrite scripts
    rewriteScripts() {
        // get scripts
        const scripts = $('script[src]').toArray().filter(script => {
            const { src } = script
            return checkSameOrigin(src) && !/createSingleHtml\.js/.test(src)
        })

        const scriptsPromises = scripts.map(script => {
            const { src } = script
            return new Promise(resolve => {
                // get script's style text
                fetch(src)
                    .then(response => response.text())
                    .then(text => {
                        // replace "script" with "full text script"
                        // const newScript = document.createElement('script')
                        // newScript.innerHTML = text
                        // $(script).replaceWith(newScript)
                        script.remove()
                        $('body').append(`<script>${text}</script>`)
                        resolve()
                    })
                    .catch(err => {
                        visualLogger.show(err.toString())
                        resolve()
                    })
            })
        })

        return Promise.all(scriptsPromises)
    },

    // rewrite images(ignore orgin)
    rewriteImages() {
        // get images
        const images = $('img[src]').toArray().filter(image => {
            const { src } = image
            const isNotBase64 = !/^data/i.test(src)
            return checkSameOrigin(src) && isNotBase64
        })

        const imagesPromises = images.map(image => {
            const { src } = image
            return new Promise(resolve => {
                // get base64 code of image
                fetch(src)
                    .then(response => response.blob())
                    .then(blob => asyncGetBase64(blob))
                    .then(base64 => {
                        // replace "image src" with "base64 src"
                        // image.setAttribute('src', '')
                        image.setAttribute('_s_r_c', base64)
                        $(image).after('' + base64.length)
                        resolve()
                    })
                    .catch(err => {
                        // Anotated for some images(other domain) may support crossing domain
                        // visualLogger.show(err.toString())
                        resolve()
                    })
            })
        })

        return Promise.all(imagesPromises)
    },

    /**
     * get full html
     */
    getFullHtml() {
        // return document.documentElement.outerHTML.replace(/createSingleHtml\.js/, 'createSingleHtml_discarded')
        return document.documentElement.outerHTML
    },

    /**
     * get full html compressed
     */
    getFullCompressedHtml() {
        // return self.getFullHtml().replace(/\n|\t/g, ' ')
    },

    /**
     * generate
     * @param {Object}
     *  @var {Number} mode 
     *   0: log in console
     *   1: download .html
     *  @var {Boolean} shouldCompress
     *  @var {Boolean} debug
     */
    generate({
        mode = 0,
        shouldCompress = true,
        debug = false
  }) {
        try {
            self.rewriteHrefToFullHref()
            self.rewriteSrcToFullSrc()


            //     .then(value => {
            //         return self.rewriteImages()
            //     })

            self.rewriteCss()
                .then(value => {
                    return self.rewriteScripts()
                })
                .then(value => {
                    debug ? null : visualLogger.hide()

                    switch (mode) {
                        case 0: return shouldCompress ? console.log(self.getFullHtml()) : console.log(self.getFullHtml())
                        case 1: return shouldCompress ? download(`${document.title}.html`, self.getFullHtml()) : download(`${document.title}.html`, self.getFullHtml())
                    }


                })
                .catch(err => {
                    visualLogger.show(err.toString())
                })
        } catch (e) {
            debug && visualLogger.show(e.toString() || 'Compile error')
        }
    },
}

self = createSingleHtml


createSingleHtml.generate({
    mode: 0,
    shouldCompress: false,
    debug: false
})


export default createSingleHtml




