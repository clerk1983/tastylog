const path = require('path')
const LOG_ROOT_DIR = process.env.LOG_ROOT_DIR || path.join(process.cwd(), './logs')

module.exports = {
  appenders: {
    ConsoleLogAppender: {
      type: 'console',
    },
    AppliationLogAppender: {
      type: 'dateFile',
      filename: path.join(LOG_ROOT_DIR, './application.log'),
      pattern: 'yyyyMMdd',
      numBackups: 7,
    },
    AccessLogAppender: {
      type: 'dateFile',
      filename: path.join(LOG_ROOT_DIR, './access.log'),
      pattern: 'yyyyMMdd',
      numBackups: 7,
    },
  },
  categories: {
    default: {
      appenders: ['ConsoleLogAppender'],
      level: 'ALL',
    },
    application: {
      appenders: ['AppliationLogAppender', 'ConsoleLogAppender'],
      level: 'INFO',
    },
    access: {
      appenders: ['AccessLogAppender', 'ConsoleLogAppender'],
      level: 'INFO',
    },
  },
}
