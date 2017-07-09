export default function getBase64(blob) {
  const reader = new FileReader()
  return new Promise(resolve => {
    reader.readAsDataURL(blob);
    reader.onloadend = function () {
      resolve(reader.result)
    }
  })
}