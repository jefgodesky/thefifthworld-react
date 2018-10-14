import mysql from 'mysql'
import config from '../../config/index'

const db = mysql.createPool(config.db)

/**
 * We add a new method to the `Pool` class that allows us to query the database
 * with a Promise.
 * @param query {string} - A MySQL query to execute.
 * @returns {Promise} - A promise that resolves with the results of the query.
 */

db.run = (query) => {
  return new Promise((resolve, reject) => {
    db.query(query, (err, rows, fields) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows, fields)
      }
    })
  })
}

export default db
