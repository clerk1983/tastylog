const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const { MySQLClient, sql } = require('../database/client')
const PRIVILEGE = {
  NORMAL: 'normal',
}

passport.serializeUser((user, done) => {
  done(null, user)
})
passport.deserializeUser((user, done) => {
  done(null, user)
})
passport.use(
  'local-strategy',
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true,
    },
    async (req, username, password, done) => {
      let results, user
      try {
        results = await MySQLClient.executeQuery(await sql('SELECT_USER_BY_EMAIL'), [username])
      } catch (error) {
        return done(error)
      }
      if (results.length === 1 && password === results[0].password) {
        user = {
          id: results[0].id,
          name: results[0].name,
          email: results[0].email,
          permissions: [PRIVILEGE.NORMAL],
        }
        req.session.regenerate((err) => {
          if (err) {
            done(err)
          } else {
            done(null, user)
          }
        })
      } else {
        done(null, false, req.flash('message', 'ユーザー名またはパスワードが間違っています'))
      }
    }
  )
)

const initialize = () => {
  return [
    passport.initialize(),
    passport.session(),
    (req, res, next) => {
      if (req.user) {
        res.locals.user = req.user
      }
      next()
    },
  ]
}

const authenticate = () => {
  return passport.authenticate('local-strategy', {
    successRedirect: '/account',
    failureRedirect: '/account/login',
  })
}

const authorize = (privilage) => {
  return (req, res, next) => {
    if (((req.isAuthenticated() && req.user.permissions) || []).indexOf(privilage) >= 0) {
      next()
    } else {
      res.redirect('/account/login')
    }
  }
}
module.exports = {
  initialize,
  authenticate,
  authorize,
  PRIVILEGE,
}
