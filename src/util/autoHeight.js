import $ from 'jquery'
$.fn.extend({
  autoHeight: function () {
    function autoHeight_(element) {
      return $(element)
        .css({ 'height': 'auto', 'overflow-y': 'hidden' })
        .height(element.scrollHeight);
    }
    return this.each(function() {
      autoHeight_(this).on('input', function() {
        autoHeight_(this);
      });
    });
  }
});