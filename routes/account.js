const router = require('express').Router()
const { authenticate, authorize, PRIVILEGE } = require('../lib/security/accesscontrol')

router.get('/', authorize(PRIVILEGE.NORMAL), (req, res) => {
  res.render('./account/index.ejs')
})

router.get('/login', (req, res) => {
  res.render('./account/login.ejs', { message: req.flash('message') })
})
router.post('/login', authenticate())

router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err)
    res.redirect('/account/login')
  })
})

router.use('/reviews', authorize(PRIVILEGE.NORMAL), require('./account.reviews.js'))

module.exports = router
