import $ from 'jquery'
import './autoHeight'

const visualLogger = {
  show(text) {
    // create logger
    if ($('#visualLogger').length === 0) {
      $('body').prepend(`
        <p>
          <textarea id="visualLogger" style="width:100%; resize:none;color:red;" disabled></textarea>
          <br />
        </p>
      `)
      // auto height
      $('#visualLogger').autoHeight()
    }
    $('#visualLogger')
      .val(text)
      .show()
  },
  hide() {
    $('#visualLogger').hide()
  }
}

export default visualLogger