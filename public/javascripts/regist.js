const btnSubmit_onclick = function () {
  var $submit = $(this)
  var $form = $submit.parents('form')
  $form.attr('method', $submit.data('method'))
  $form.attr('action', $submit.data('action'))
  $form.submit()
  $submit.off().prop('disabled', true)
  $form.on('submit', false)
}

const document_onready = function () {
  $("input[type='submit']").on('click', btnSubmit_onclick)
}

$(document).ready(document_onready)
