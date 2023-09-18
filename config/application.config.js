module.exports = {
  PORT: process.env.PORT || 3000,
  security: {
    SESSION_SECRET: 'YOUR_SESSION_SECRET_STRING',
    ACCOUNT_LOCK_WINDOW: 30,
    ACCOUNT_LOCK_THRESHOLD: 5,
    ACCOUNT_LOCK_TIME: 60,
    MAX_LOGIN_HISTORY: 20,
  },
  search: {
    MAX_ITEM_PER_PAGE: 5,
  },
}
