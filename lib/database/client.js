const path = require('path')
const { sql } = require('@garafu/mysql-fileloader')({
  root: path.join(__dirname, './sql'),
})
const pool = require('./pool')
const Transaction = require('./transaction')

const MySQLClient = {
  executeQuery: async (query, values) => {
    const results = await pool.executeQuery(query, values)
    return results
  },
  beginTransaction: async () => {
    const tran = new Transaction()
    await tran.begin()
    return tran
  },
}

module.exports = {
  MySQLClient,
  sql,
}
