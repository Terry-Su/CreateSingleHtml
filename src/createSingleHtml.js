import 'babel-polyfill'

import $ from 'jquery'
import './util/fetch'
import xttpFetch from './util/xttpFetch'
import base64XttpFetch from './util/base64XttpFetch'

import { checkSameOrigin } from './util/index'
import asyncGetBase64 from './util/asyncGetBase64'
import download from './util/download.js'
let self

window.UnitTest = window.UnitTest || {}
Object.assign(window.UnitTest, {
    checkSameOrigin
})




const createSingleHtml = {
    /**
     * 
     */
    splitSymbol: `createSingleHtml${Date.now()}${Date.now()}`,

    /**
     * resolve link
     * @param {Object} link
     * @param {String} text the text can be got by link
     */
    resolveLink(link, text) {
        $(link).replaceWith(`<style>${text}</style>`)
        // $(link).replaceWith(`<!--${self.splitSymbol}<style>${text}</style>${self.splitSymbol}-->`)        
    },

    /**
     * resolve script
     * @param {Object} script
     * @param {String} text the text can be got by script
     */
    resolveScript(script, text) {
        $(script).replaceWith(`<!--${self.splitSymbol}<script>${text}</script>${self.splitSymbol}-->`)
    },

    /**
     * resolve image
     * @param {Object} image 
     * @param {String} base64 base64 code
     */
    resolveImage(image, base64) {
        image.setAttribute('src', base64)
    },

    /**
     * resolve href to full href
     * example: "<link href="./test.css" />" --> "<link href="http://domain/test.css" />"
     */
    resolveHrefToFullHref() {
        const $hrefDoms = $('[href]')
        $hrefDoms.each((i, dom) => {
            const { href } = dom
            dom.href = href
        })
    },

    /**
     * resolve src to full src
     * example: "<script src="/test.js"></script>" --> "<script src="http://doamin/test.js"></script>"
     */
    resolveSrcToFullSrc() {
        const $srcDoms = $('[src]')
        $srcDoms.each((i, dom) => {
            const { src } = dom
            dom.src = src
        })
    },

    /**
     * resolve links
     */
    resolveLinks() {
        // get css links
        const links = $('[href$="css"]').toArray().filter(link => checkSameOrigin(link.href))
        const linksPromises = links.map(link => {
            const { href } = link
            // get css's style text
            return new Promise(
                (resolve, reject) => {
                    fetch(href)
                        .then(response => response.text())
                        .then(text => {
                            self.resolveLink(link, text)
                            resolve()
                        })
                        .catch(err => {
                            xttpFetch(href)
                                .then(text => {
                                    self.resolveLink(link, text)
                                    resolve()
                                })
                                .catch(err => {
                                    reject('fetch css or xttpFetch failed')
                                })
                        })
                }
            )
        })

        return Promise.all(linksPromises)
    },


    // resolve scripts
    resolveScripts() {
        // get scripts
        const scripts = $('script[src]').toArray().filter(script => {
            const { src } = script
            return checkSameOrigin(src) && !/createSingleHtml\.js/.test(src)
        })

        const scriptsPromises = scripts.map(script => {
            const { src } = script
            return new Promise(
                (resolve, reject) => {
                    // get script's style text
                    fetch(src)
                        .then(response => response.text())
                        .then(text => {
                            self.resolveScript(script, text)
                            resolve()
                        })
                        .catch(err => {
                            xttpFetch(src)
                                .then(text => {
                                    self.resolveScript(script, text)
                                    resolve()
                                })
                                .catch(err => {
                                    reject('fetch script or xttpFetch failed')
                                })
                        })
                })
        })

        return Promise.all(scriptsPromises)
    },

    // resolve images(ignore orgin)
    resolveImages() {
        // get images
        const images = $('img[src]').toArray().filter(image => {
            const { src } = image
            const isNotBase64 = !/^data/i.test(src)
            return checkSameOrigin(src) && isNotBase64
        })

        const imagesPromises = images.map(image => {
            const { src } = image
            return new Promise(
                (resolve, reject) => {
                    // get base64 code of image
                    // fetch(src)
                    // .then(response => response.blob())
                    // .then(blob => asyncGetBase64(blob))
                    base64XttpFetch(src)
                        .then(base64 => {
                            self.resolveImage(image, base64)
                            resolve()
                        })
                        .catch(err => {
                            base64XttpFetch(src)
                                .then(base64 => {
                                    self.resolveImage(image, base64)
                                    resolve()
                                })
                                .catch(err => {
                                    reject('fetch image or base64XttpFetch failed')
                                })
                        })
                })
        })

        return Promise.all(imagesPromises)
    },

    /**
     * get full html
     */
    getFullHtml() {
        const start = new RegExp(`<!--${self.splitSymbol}`,'g')
        const end = new RegExp(`${self.splitSymbol}-->`, 'g')
        return document.documentElement.outerHTML.replace(start, '').replace(end, '').replace(/createSingleHtml\.js/, 'createSingleHtml_discarded')
    },

    /**
     * generate
     * @param {Object}
     *  @var {Number} mode 
     *   0: log in console
     *   1: download .html
     *  @var {Boolean} debug
     *  @var {Boolean} shouldUpdateCss
     *  @var {Boolean} shouldUpdateScript
     *  @var {Boolean} shouldUpdateImage
     */
    generate({
        mode = 0,
        debug = false,
        shouldUpdateCss = true,
        shouldUpdateScript = true,
        shouldUpdateImage = true
  }) {
        try {

            {
                shouldUpdateCss && self.resolveHrefToFullHref()
            }

            {
                (shouldUpdateScript || shouldUpdateImage) && self.resolveSrcToFullSrc()
            }

            Promise.all([
                shouldUpdateCss && new Promise((resolve, reject) => {
                    self.resolveLinks()
                        .then(value => {
                            resolve(value)
                        })
                        .catch(err => {
                            reject(err)
                        })
                }),
                shouldUpdateScript && new Promise((resolve, reject) => {
                    self.resolveScripts()
                        .then(value => {
                            resolve(value)
                        })
                        .catch(err => {
                            reject(err)
                        })
                }),
                shouldUpdateImage && new Promise((resolve, reject) => {
                    self.resolveImages()
                        .then(value => {
                            resolve(value)
                        })
                        .catch(err => {
                            reject(err)
                        })
                })
            ])
            .then(value => {
                switch(mode) {
                    case 0: return console.log(self.getFullHtml())
                    case 1: return download(`download_${document.title}.html`, self.getFullHtml())
                }
            })

        } catch (e) {
            console.log(e)
        }
    },
}

self = createSingleHtml


createSingleHtml.generate({
    mode: 0
})



function output(content) {
    document.body.innerHTML = 'test'
}

// export default createSingleHtml




