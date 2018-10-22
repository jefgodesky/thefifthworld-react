import bcrypt from 'bcrypt-nodejs'
import uuid from 'uuid/v4'
import { updateVals } from '../utils'
import parse from '../../shared/parse'

const msgTypes = {
  confirm: 'confirmation',
  error: 'error',
  warning: 'warning',
  info: 'info'
}

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
    this.invitations = obj.invitations
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
   *   just one record matches, an array of Member objects if several match, or
   *   `null` if no records match.
   */

  static async find (params, db) {
    const fields = Object.keys(params)
    const where = []
    const valid = [ 'id', 'name', 'email', 'active', 'admin', 'invitations' ]
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
      return members.length > 0 ? members : null
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
   * Returns true if `editor` is authorized to edit the profile of `subject`.
   * @param subject {object} - An object representation of a member.
   * @param editor {object} - An object representation of a member.
   * @returns {boolean} - `true` if the `editor` is authorized to edit the
   *   profile of `subject`, or `false` otherwise.
   */

  static canEdit (subject, editor) {
    return (subject && editor && (subject.id === editor.id)) ||
      (editor && editor.admin)
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
   * @params editor {Object} - An object representation of the member trying to
   *   make this update.
   * @param db {Pool} - A database connection.
   * @returns {Promise} - A promise that resolves when the UPDATE statement has
   *   been run.
   */

  async update (vals, editor, db) {
    if (Member.canEdit(this.getObject(), editor)) {
      const query = updateVals([
        { name: 'name', type: 'string' },
        { name: 'email', type: 'string' }
      ], vals)
      await db.run(`UPDATE members SET ${query} WHERE id=${this.id}`)
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
    if (this.password) {
      return bcrypt.compareSync(given, this.password)
    } else {
      return false
    }
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

  static async getMessages (id, db) {
    const messages = await db.run(`SELECT * FROM messages WHERE member=${id}`)
    if (messages.length > 0) {
      const res = {}
      messages.forEach(msg => {
        const message = parse(msg.message)
        if (res[msg.type]) {
          res[msg.type] = [...res[msg.type], message]
        } else {
          res[msg.type] = [message]
        }
        db.run(`DELETE FROM messages WHERE id=${msg.id};`)
      })
      return res
    } else {
      return {}
    }
  }

  async logMessage (type, msg, db) {
    const validTypes = Object.keys(msgTypes).map(type => msgTypes[type])
    const checkedType = validTypes.indexOf(type) > -1 ? type : msgTypes.info
    await db.run(`INSERT INTO messages (member, type, message) VALUES (${this.id}, '${checkedType}', '${msg}');`)
  }

  async hasInvitations (db) {
    const res = await db.run(`SELECT admin, invitations FROM members WHERE id='${this.id}';`)
    return res[0].admin || res[0].invitations > 0
  }

  async createInvitation (email, emailer, db) {
    const code = uuid()
    const account = await db.run(`INSERT INTO members (email) VALUES ('${email}');`)
    await db.run(`INSERT INTO invitations (inviteFrom, inviteTo, inviteCode) VALUES (${this.id}, ${account.insertId}, '${code}');`)
    if (!this.admin) {
      await db.run(`UPDATE members SET invitations=${this.invitations - 1} WHERE id=${this.id}`)
    }
    await emailer({
      to: email,
      subject: 'Welcome to the Fifth World',
      body: `${this.getName()} has invited you to join the Fifth World. Click here to begin:\n\nhttps://thefifthworld.com/join/${code}`
    })
    await this.logMessage(msgTypes.confirm, `Invitation sent to '''${email}'''.`, db)
  }

  async sendReminder (member, emailer, db) {
    const invitation = await db.run(`SELECT inviteCode FROM invitations WHERE inviteTo=${member.id} AND accepted=0;`)
    if (invitation.length > 0) {
      await emailer({
        to: member.email,
        subject: 'Your invitation to the Fifth World is waiting',
        body: `${this.getName()} wants to remind you that you’ve been invited to join the Fifth World. Click here to begin:\n\nhttps://thefifthworld.com/join/${invitation[0].inviteCode}`
      })
      await this.logMessage(msgTypes.confirm, `'''${member.email}''' already had an invitation, so we sent a reminder.`, db)
    } else {
      await this.logMessage(msgTypes.info, `[/member/${member.id} ${member.getName()}] already has an account.`, db)
    }
  }

  async sendInvitation (email, emailer, db) {
    const hasInvitations = await this.hasInvitations(db)
    if (hasInvitations) {
      const existing = await Member.find({ email }, db)
      if (existing) {
        await this.sendReminder(existing, emailer, db)
      } else {
        await this.createInvitation(email, emailer, db)
      }
    }
  }

  static async sendInvitations (inviterId, emails, emailer, db) {
    const inviter = await Member.get(inviterId, db)
    const invited = (inviter.admin || (inviter.invitations > emails.length))
      ? emails
      : emails.slice(0, inviter.invitations)
    invited.forEach(async email => {
      await inviter.sendInvitation(email, emailer, db)
    })
    if (invited.length < emails.length) {
      await this.logMessage(msgTypes.error, `Sorry — you wanted to invite ${emails.length} people, but you only had ${inviter.invitations} invitations.`, db)
    }
  }

  static async getInvited (inviterId, db) {
    const res = await db.run(`SELECT m.id, m.name, m.email, i.accepted FROM members m, invitations i WHERE m.id=i.inviteTo AND i.inviteFrom=${inviterId};`)
    const invited = []
    res.forEach(record => {
      invited.push({
        id: record.id,
        name: record.name ? record.name : record.email,
        accepted: Boolean(record.accepted)
      })
    })
    return invited
  }
}

export default Member
