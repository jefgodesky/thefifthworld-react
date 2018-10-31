/**
 * This method takes an array that provides the names and types for the
 * columns in a database and an object with data, and returns a string
 * appropriate for an UPDATE SQL statement, where only those keys in the data
 * object which match defined columns in the table are included.
 * @param cols {Array} - An array of objects, each one with a `name` property
 *   with the name of a column, and a `type` property with its type (not the
 *   specific type used by the database, though; just a generic type, e.g.,
 *   'number' or 'string').
 * @param vals {Object} - An object with data, intended to be sent to a
 *   database in an UPDATE statement.
 * @returns {string} - A string formatting the appropriate values for an
 *   UPDATE statement.
 */

const updateVals = (cols, vals) => {
  const query = []
  const validKeys = []
  const types = {}
  cols.forEach(col => {
    validKeys.push(col.name)
    types[col.name] = col.type
  })

  Object.keys(vals).forEach(key => {
    if (validKeys.indexOf(key) > -1) {
      const val = types[key] === 'number' ? vals[key] : `'${vals[key]}'`
      query.push(`${key}=${val}`)
    }
  })
  return query.join(', ')
}

/**
 * This method generates a random string to serve as an invitation code. It
 * checks the database to make sure that it's unique, and no other invitation
 * has ever been sent before with that code.
 * @param db {Pool} - A database connection.
 * @returns {Promise} - A promise that resolves with a unique, random string
 *   that can be used as an invitation code.
 */

const generateInvitationCode = async db => {
  let code = ''
  while (code === '') {
    code = Math.random().toString(36).replace('0.', '')
    const check = await db.run(`SELECT id FROM invitations WHERE inviteCode='${code}';`)
    if (check.length > 0) code = ''
  }
  return code
}

export {
  updateVals,
  generateInvitationCode
}
