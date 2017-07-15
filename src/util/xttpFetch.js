/**
 * Resolve some special urls like 'content://...'
 * @param {String} url 
 */
export default function xttpFetch(url) {
  return Promise.resolve(new Promise(function (resolve, reject) {
    try {
      let xmlhttp
      if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari 
        xmlhttp = new XMLHttpRequest()
      } else {
        // code for IE6, IE5 
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP")
      }
      xmlhttp.onreadystatechange = function () {

        if (xmlhttp.readyState == 4) {
          if (xmlhttp.status == 200) {
            resolve(xmlhttp.responseText)
          } else {
            reject('xttpFetch failed')
          }
        }
      }
      xmlhttp.open("GET", url, true)
      xmlhttp.send()
    } catch (e) {
      reject('customFetch failed')
    }
  }))
}