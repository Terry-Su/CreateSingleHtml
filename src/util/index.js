/**
 * chekcout url is same origin or not
 * @param {*} url 
 */
export function checkSameOrigin(url = '', windowGlobal) {
  const { location, document } = windowGlobal || window
  const a = document.createElement('a')
  a.href = url
  const result = a.hostname === location.hostname && a.port === location.port && a.protocol === location.protocol
  a.remove()
  return result
}