const pool = require('./pool')
class Transaction {
  constructor(connection) {
    this.connection = connection
  }
  async begin() {
    if (this.connection) {
      this.connection.release()
    }
    this.connection = await pool.getConnection()
    this.connection.beginTransaction()
  }
  async executeQuery(query, values, options = {}) {
    options = {
      fields: options.fields || false,
    }
    return new Promise((resolve, reject) => {
      this.connection.query(query, values, (err, results, fields) => {
        if (!err) {
          resolve(!options.fields ? results : { fields, results })
        } else {
          reject(err)
        }
      })
    })
  }
  async commit() {
    return new Promise((resolve, reject) => {
      this.connection.commit((err) => {
        this.connection.release()
        this.connection = null
        if (!err) {
          resolve()
        } else {
          reject(err)
        }
      })
    })
  }
  async rollback() {
    return new Promise((resolve) => {
      this.connection.rollback(() => {
        this.connection.release()
        this.connection = null
        resolve()
      })
    })
  }
}
module.exports = Transaction
