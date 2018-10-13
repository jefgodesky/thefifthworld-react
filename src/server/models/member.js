import bcrypt from 'bcrypt-nodejs'
import uuid from 'uuid/v4'

/**
 * This model handles dealing with member data in the database.
 */

class Member {
  constructor (obj) {
    this.id = obj.id
    this.name = obj.name
    this.password = obj.password
    this.email = obj.email
    this.active = obj.active
    this.admin = obj.admin
  }

  /**
   * Returns a member with the matching ID.
   * @param id {int} - The user's ID number.
   * @param db {Pool} - A database connection.
   * @returns {Promise} - A promise which will return an object with the
   *   member's name, email, and ID.
   */

  static get (id, db) {
    return new Promise((resolve, reject) => {
      db.q(`SELECT id, name, email FROM members WHERE id='${id}'`)
        .then(rows => {
          resolve(new Member(rows[0]))
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  /**
   * Runs a query for all members matching the parameters provided.
   * @param params {object} - An object that specifies the parameters for the
   *   query as a series of key/value pairs.
   * @param db {Pool} - A database connection.
   * @returns {Promise} - A promise that resolves with an array of the rows
   *   returned by the query.
   */

  static find (params, db) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(params)
      const where = []
      const valid = [ 'id', 'name', 'email', 'active', 'admin' ]
      fields.forEach(field => {
        if (valid.indexOf(field) > -1) where.push(`${field}='${params[field]}'`)
      })

      db.q(`SELECT * FROM members WHERE ${where.join(' AND ')}`)
        .then(rows => {
          if (rows.length === 1) {
            resolve(new Member(rows[0]))
          } else {
            const members = []
            rows.forEach(row => {
              members.push(new Member(row))
            })
            resolve(members)
          }
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  /**
   * Returns the member's ID.
   * @returns {int} - The member's ID.
   */

  getId () {
    return this.id
  }

  /**
   * Returns the member's name. It starts with the name field. If that is not
   * set, it instead returns the email address. If neither of those are set, it
   * returns the member's ID number (e.g., "Member #42").
   * @returns {string} - The member's name.
   */

  getName () {
    if (this.name) {
      return this.name
    } else if (this.email) {
      return this.email
    } else {
      return `Member #${this.id}`
    }
  }

  /**
   * Checks the bcrypt hash of the given string against the stored password.
   * @param given {string} - A string that might be the member's password, or
   *   not. That's what we're here to find out.
   * @returns {boolean} - True if the given string matches the member's
   *   password, or false if it doesn't.
   */

  checkPass (given) {
    console.log(`Is "${given}" the right password?`)
    console.log(bcrypt.hashSync(given, bcrypt.genSaltSync(8), null))
    console.log(this.password)
    if (this.password) {
      return bcrypt.compareSync(given, this.password)
    } else {
      return false
    }
  }

  /**
   * Sends a reminder email for an invitation.
   * @param invited {Object} - An object including an `email` field (a string
   *   that is the email address that the reminder should be sent to) and an
   *   `inviteCode` field (a string that is the unique invitation code for that
   *   person).
   * @param emailer {function} - A function that can send an email.
   * @returns {Promise} - A promise that resolves when the email has been sent.
   */

  sendReminder (invited, emailer) {
    return emailer({
      to: invited.email,
      subject: 'Welcome to the Fifth World',
      body: `${this.getName()} has invited you to join the Fifth World community. Click below to begin:\n\nhttps://thefifthworld.com/join/${invited.inviteCode}`
    })
  }

  /**
   * Iterates over a set of rows and calls the `sendReminder` method for each.
   * @param rows {Array.<Object>} - An array of objects, each one including an
   *   `email` field (a string that is the email address that the reminder
   *   should be sent to) and an `inviteCode` field (a string that is the
   *   unique invitation code for that person).
   * @param emailer {function} - A function that can send an email.
   * @returns {Promise} - A promise that resolves when the promises for each of
   *   the individual `sendReminder` method calls for each row have resolved.
   */

  sendReminders (rows, emailer) {
    const reminders = []
    rows.forEach(row => {
      reminders.push(this.sendReminder(row, emailer))
    })
    return Promise.all(reminders)
  }

  /**
   * Creates a new member entry in the database, creates a new invitation entry
   * for that member, and sends an invitation email to the new member so she
   * can access her new account.
   * @param email {string} - The new member's email address.
   * @param db {Pool} - A database connection.
   * @param emailer {function} - A function that can send an email.
   * @returns {Promise} - A promise that resolves when the new member entry and
   *   invitation entries have been created in the database and the invitation
   *   email has been sent.
   */

  createInvite (email, db, emailer) {
    let invite = {}
    return new Promise((resolve, reject) => {
      db.q(`INSERT INTO members (email) VALUES ('${email}')`)
        .then(res => {
          invite.code = uuid()
          return db.q(`INSERT INTO invitations (inviteFrom, inviteTo, inviteCode) VALUES ('${this.id}', '${res.insertId}', '${invite.code}')`)
        })
        .then(res => {
          if (res.affectedRows === 1) {
            invite.email = email
            invite.inviteId = res.insertId
            return emailer({
              to: email,
              subject: 'Welcome to the Fifth World',
              body: `${this.getName()} has invited you to join the Fifth World community. Click below to begin:\n\nhttps://thefifthworld.com/join/${invite.code}`
            })
          } else {
            const warning = (res.affectedRows === 0)
              ? 'Invitation was not created in database'
              : (res.affectedRows > 1)
                ? 'More than one row was created when inserting invitation!'
                : 'Negative rows affected when inserting invitation?'
            reject(warning)
          }
        })
        .then(() => {
          resolve(invite)
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  /**
   * If the email is already in the members table, the array of matching rows
   * is passed to `sendReminders`. If no record is found with the given email
   * address, it is passed to `createInvite`.
   * @param email {string} - An email address to send an invitation to.
   * @param db {Pool} - A database connection.
   * @param emailer {function} - A function that can send an email.
   * @returns {Promise} - A Promise that queries the MySQL members table for
   *   any members with the given email address. If found, the matching rows
   *   are passed to `sendReminders`. If no records are found, the email is
   *   passed to `createInvite`.
   */

  invite (email, db, emailer) {
    return new Promise((resolve, reject) => {
      db.q(`SELECT m.id, m.email, i.inviteCode FROM members m, invitations i WHERE m.email='${email}' AND i.inviteTo = m.id`)
        .then(rows => {
          if (rows.length > 0) {
            return this.sendReminders(rows, emailer)
          } else {
            return this.createInvite(email, db, emailer)
          }
        })
        .then(res => {
          resolve(res)
        })
        .catch(err => {
          reject(err)
        })
    })
  }
}

export default Member
