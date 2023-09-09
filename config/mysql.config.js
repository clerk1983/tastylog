module.exports = {
  HOST: process.env.MYSQL_HOST || '127.0.0.1',
  PORT: process.env.MYSQL_PORT || '3306',
  USERNAME: process.env.MYSQL_USERNAME || 'root',
  PASSWORD: process.env.MYSQL_PASSWORD || 'password',
  DATABASE: process.env.MYSQL_DATABASE || 'tastylog',
  CONCTION_LIMIT: process.env.CONCTION_LIMIT
    ? parseInt(process.env.CONCTION_LIMIT)
    : 10,
  QUEUE_LIMIT: process.env.CONCTION_LIMIT
    ? parseInt(process.env.CONCTION_LIMIT)
    : 0,
}
