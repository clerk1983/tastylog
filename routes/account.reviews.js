const router = require('express').Router()
const { MySQLClient, sql } = require('../lib/database/client.js')
const moment = require('moment')
const tokens = new require('csrf')()
const DATE_FORMAT = 'YYYY/MM/DD'

var validateReviewData = function (req) {
  var body = req.body
  var isValid = true,
    error = {}

  if (body.visit && !moment(body.visit, DATE_FORMAT).isValid()) {
    isValid = false
    error.visit = '訪問日の日付文字列が不正です。'
  }

  if (isValid) {
    return undefined
  }
  return error
}

var createReviewData = function (req) {
  var body = req.body,
    date

  return {
    shopId: req.params.shopId,
    score: parseFloat(body.score),
    visit:
      (date = moment(body.visit, DATE_FORMAT)) && date.isValid()
        ? date.toDate()
        : null,
    post: new Date(),
    description: body.description,
  }
}

router.get('/regist/:shopId(\\d+)', async (req, res, next) => {
  var shopId = req.params.shopId
  var shop, shopName, review, results
  const secret = await tokens.secret()
  const token = tokens.create(secret)
  req.session._csrf = secret
  res.cookie('_csrf', token)

  try {
    results = await MySQLClient.executeQuery(
      await sql('SELECT_SHOP_BASIC_BY_ID'),
      [shopId]
    )
    shop = results[0] || {}
    shopName = shop.name
    review = {}
    res.render('./account/reviews/regist-form.ejs', {
      shopId,
      shopName,
      review,
    })
  } catch (err) {
    next(err)
  }
})

router.post('/regist/:shopId(\\d+)', async (req, res) => {
  var review = createReviewData(req)
  var { shopId, shopName } = req.body
  res.render('./account/reviews/regist-form.ejs', { shopId, shopName, review })
})

router.post('/regist/confirm', (req, res) => {
  var error = validateReviewData(req)
  var review = createReviewData(req)
  var { shopId, shopName } = req.body

  if (error) {
    res.render('./account/reviews/regist-form.ejs', {
      error,
      shopId,
      shopName,
      review,
    })
    return
  }

  res.render('./account/reviews/regist-confirm.ejs', {
    shopId,
    shopName,
    review,
  })
})

router.post('/regist/execute', async (req, res, next) => {
  const secret = req.session._csrf
  const token = req.cookies._csrf
  if (tokens.verify(secret, token) === false) {
    next(new Error('Invalid Token.'))
    return
  }

  const error = validateReviewData(req)
  const review = createReviewData(req)
  const { shopId, shopName } = req.body
  const userId = 1 // TODO
  if (error) {
    res.render('./account/reviews/regist-form.ejs', {
      error,
      shopId,
      shopName,
      review,
    })
    return
  }
  let tran
  try {
    tran = await MySQLClient.beginTransaction()
    await tran.executeQuery(await sql('SELECT_SHOP_BY_ID_FOR_UPDATE'), [shopId])
    await tran.executeQuery(await sql('INSERT_SHOP_REVIEW'), [
      shopId,
      userId,
      review.score,
      review.visit,
      review.description,
    ])
    await tran.executeQuery(await sql('UPDATE_SHOP_SCORE'), [shopId, shopId])
    await tran.commit()
  } catch (error) {
    tran.rollback()
    next(error)
  }
  delete req.session._csrf
  res.clearCookie('_csrf')

  res.redirect(`/account/reviews/regist/complete?shopId=${shopId}`)
})

router.get('/regist/complete', (req, res) => {
  const { shopId } = req.query
  res.render('./account/reviews/regist-complete.ejs', { shopId })
})

module.exports = router
