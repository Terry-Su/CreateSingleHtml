/**
 * Resolve some special urls like 'content://...'
 * @param {String} url 
 */
export default function base64XttpFetch(url) {
  return Promise.resolve(new Promise(function (resolve, reject) {
    try {
      let xhr = new XMLHttpRequest()
      xhr.responseType = 'blob'
      xhr.onload = function () {
        var reader = new FileReader()
        reader.onloadend = function () {
          resolve(reader.result)
        }
        reader.readAsDataURL(xhr.response)
      }

      // if the image cannot be got
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 404) {
          reject('base64XttpFetch: the image cannot be got')
        }
      }

      xhr.open('GET', url)
      xhr.send()

    } catch (e) {
      reject('base64XttpFetch failed')
    }
  }))
}