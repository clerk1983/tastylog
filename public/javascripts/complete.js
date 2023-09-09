$(document).ready(() => {
  history.pushState(null, null, null)
  $(window).on('popstate', () => {
    history.pushState(null, null, null)
  })
})
