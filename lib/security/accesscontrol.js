const { ACCOUNT_LOCK_WINDOW, ACCOUNT_LOCK_THRESHOLD, ACCOUNT_LOCK_TIME, MAX_LOGIN_HISTORY } =
  require('../../config/application.config').security
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const { MySQLClient, sql } = require('../database/client')
const moment = require('moment')
const PRIVILEGE = {
  NORMAL: 'normal',
}
const LOGIN_STATUS = {
  SUCCESS: 0,
  FAILURE: 1,
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
      let tran, results, user
      const now = new Date()
      try {
        // Get user info
        tran = await MySQLClient.beginTransaction()
        results = await tran.executeQuery(await sql('SELECT_USER_BY_EMAIL_FOR_UPDATE'), [username])
        if (results.length !== 1) {
          tran.commit()
          return done(
            null,
            false,
            req.flash('message', 'ユーザー名またはパスワードが間違っています')
          )
        }
        user = {
          id: results[0].id,
          name: results[0].name,
          email: results[0].email,
          permissions: [PRIVILEGE.NORMAL],
        }
        // Check account lock status
        if (
          results[0].locked &&
          moment(now).isSameOrBefore(moment(results[0].locked).add(ACCOUNT_LOCK_TIME, 'minutes'))
        ) {
          tran.commit()
          return done(null, false, req.flash('message', 'アカウントがロックされています'))
        }

        // Delete login log
        await tran.executeQuery(await sql('DELETE_LOGIN_HISTORY'), [
          user.id,
          user.id,
          MAX_LOGIN_HISTORY - 1,
        ])

        // Compare password
        if (!(await bcrypt.compare(password, results[0].password))) {
          // Insert login log
          await tran.executeQuery(await sql('INSERT_LOGIN_HISTORY'), [
            user.id,
            now,
            LOGIN_STATUS.FAILURE,
          ])

          // Lock account, if need
          const tmp = await tran.executeQuery(await sql('COUNT_LOGIN_HISTORY'), [
            user.id,
            moment(now).subtract(ACCOUNT_LOCK_WINDOW, 'minutes').toDate(),
            LOGIN_STATUS.FAILURE,
          ])
          const count = tmp[0]?.count ?? 0
          if (count >= ACCOUNT_LOCK_THRESHOLD) {
            await tran.executeQuery(await sql('UPDATE_USER_LOCKED'), [now, user.id])
          }

          tran.commit()
          return done(
            null,
            false,
            req.flash('message', 'ユーザー名またはパスワードが間違っています')
          )
        }

        // Insert login log
        await tran.executeQuery(await sql('INSERT_LOGIN_HISTORY'), [
          user.id,
          now,
          LOGIN_STATUS.SUCCESS,
        ])
        await tran.executeQuery(await sql('UPDATE_USER_LOCKED'), [null, user.id])
        tran.commit()
      } catch (error) {
        tran.rollback()
        return done(error)
      }

      // Session regenerate
      req.session.regenerate((err) => {
        if (err) {
          done(err)
        } else {
          done(null, user)
        }
      })
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
