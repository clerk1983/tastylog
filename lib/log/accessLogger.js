const log4js = require('log4js')
const logger = require('./logger.js').access
const DEFAULT_LOG_LEVEL = 'auto'

module.exports = function (options) {
  options = options || {}
  options.level = options.level || DEFAULT_LOG_LEVEL
  options.format =
    options.format ||
    ((req, res, format) => {
      let address = req.headers['x-fowarded-for'] || req.ip
      address = address.replace(/(\.|:)\d+(,|$)/g, '$10$2')
      return format(
        `${address} ` +
          ':method ' +
          ':url ' +
          'HTTP/:http-version ' +
          ':status ' +
          ':response-time ' +
          ':user-agent'
      )
    })
  return log4js.connectLogger(logger, options)
}
