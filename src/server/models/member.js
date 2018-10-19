import bcrypt from 'bcrypt-nodejs'
import uuid from 'uuid/v4'
import { updateVals } from '../utils'

/**
 * This model handles dealing with member data in the database.
 */

class Member {
  constructor (obj) {
    this.id = obj.id
    this.name = obj.name
    this.password = obj.password
    this.email = obj.email
    this.active = Boolean(obj.active)
    this.admin = Boolean(obj.admin)
  }

  /**
   * Returns a member with the matching ID.
   * @param id {int} - The user's ID number.
   * @param db {Pool} - A database connection.
   * @returns {mixed} - The Member object that matches the given ID if it can
   *   be found, or `false` if it cannot.
   */

  static async get (id, db) {
    const rows = await db.run(`SELECT * FROM members WHERE id='${id}'`)
    return rows.length > 0
      ? new Member(rows[0])
      : false
  }

  /**
   * Runs a query for all members matching the parameters provided.
   * @param params {object} - An object that specifies the parameters for the
   *   query as a series of key/value pairs.
   * @param db {Pool} - A database connection.
   * @returns {mixed} - A Member object that matches the given parameters if
   *   just one record matches, or an array of Member objects otherwise.
   */

  static async find (params, db) {
    const fields = Object.keys(params)
    const where = []
    const valid = [ 'id', 'name', 'email', 'active', 'admin' ]
    fields.forEach(field => {
      if (valid.indexOf(field) > -1) where.push(`${field}='${params[field]}'`)
    })
    const rows = await db.run(`SELECT * FROM members WHERE ${where.join(' AND ')}`)
    if (rows.length === 1) {
      return new Member(rows[0])
    } else {
      const members = []
      rows.forEach(row => {
        members.push(new Member(row))
      })
      return members
    }
  }

  /**
   * This method is used with OAuth2 authentication. Given a particular service
   * (e.g., 'google' or 'facebook') and an ID, it returns a Member object for
   * the matching member.
   * @param service {string} - The service that provided the OAuth2 token. Can
   *   be 'google', 'facebook', 'twitter', 'discord', 'patreon', or 'github'.
   * @param id {string} - The OAuth2 ID.
   * @param db {Pool} - A database connection.
   * @returns {Promise} - A Promise that resolves either with the matching
   *   Member or with `false` if one could not be found.
   */

  static async findAuth (service, id, db) {
    const res = await db.run(`SELECT m.* FROM members m, authorizations a WHERE m.id=a.member AND a.provider='${service}' AND a.oauth2_id='${id}';`)
    return (res.length === 1)
      ? new Member(res[0])
      : false
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
   * Sets the member's name to the given string.
   * @param name {string} - The string to set the member's name to.
   * @param db {Pool} - A database connection.
   */

  async setName (name, db) {
    await db.run(`UPDATE members SET name='${name}' WHERE id=${this.id};`)
  }

  /**
   * Returns an object representation of the member.
   * @returns {Object} - An object representation of the member.
   */

  getObject () {
    return {
      id: this.id,
      name: this.getName(),
      email: this.email,
      active: Boolean(this.active),
      admin: Boolean(this.admin)
    }
  }

  /**
   * Update the member's record in the database.
   * @param vals {Object} - An object containing key/value pairs, specifying
   *   what to update the member record to.
   * @param db {Pool} - A database connection.
   * @returns {Promise} - A promise that resolves when the UPDATE statement has
   *   been run.
   */

  async update (vals, db) {
    const query = updateVals([
      { name: 'name', type: 'string' },
      { name: 'email', type: 'string' }
    ], vals)
    await db.run(`UPDATE members SET ${query} WHERE id=${this.id}`)
  }

  /**
   * Checks the bcrypt hash of the given string against the stored password.
   * @param given {string} - A string that might be the member's password, or
   *   not. That's what we're here to find out.
   * @returns {boolean} - True if the given string matches the member's
   *   password, or false if it doesn't.
   */

  checkPass (given) {
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

  async createInvite (email, db, emailer) {
    let invite = {}
    invite.code = uuid()
    const newMember = await db.run(`INSERT INTO members (email) VALUES ('${email}')`)
    const createInvitation = await db.run(`INSERT INTO invitations (inviteFrom, inviteTo, inviteCode) VALUES ('${this.id}', '${newMember.insertId}', '${invite.code}')`)
    if (createInvitation.affectedRows === 1) {
      invite.email = email
      invite.inviteId = createInvitation.insertId
      return emailer({
        to: email,
        subject: 'Welcome to the Fifth World',
        body: `${this.getName()} has invited you to join the Fifth World community. Click below to begin:\n\nhttps://thefifthworld.com/join/${invite.code}`
      })
    } else {
      const warning = (createInvitation.affectedRows === 0)
        ? 'Invitation was not created in database'
        : (createInvitation.affectedRows > 1)
          ? 'More than one row was created when inserting invitation!'
          : 'Negative rows affected when inserting invitation?'
      throw new Error(warning)
    }
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

  async invite (email, db, emailer) {
    const rows = await db.run(`SELECT m.id, m.email, i.inviteCode FROM members m, invitations i WHERE m.email='${email}' AND i.inviteTo = m.id`)
    const val = (rows.length > 0)
      ? await this.sendReminders(rows, emailer)
      : await this.createInvite(email, db, emailer)
    return val
  }

  /**
   * Adds an OAuth2 authentication token for a member.
   * @param service {string} - The service that provided the OAuth2 token. Can
   *   be 'google', 'facebook', 'twitter', 'discord', 'patreon', or 'github'.
   * @param id {string} - The OAuth2 Id
   * @param token {string} - The OAuth2 token.
   * @param db {Pool} - A database connection.
   */

  async addAuth (service, id, token, db) {
    await db.run(`INSERT INTO authorizations (member, provider, oauth2_id, oauth2_token) VALUES (${this.id}, '${service}', '${id}', '${token}');`)
  }
}

export default Member
