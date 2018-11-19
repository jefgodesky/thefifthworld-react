import bcrypt from 'bcrypt-nodejs'
import { updateVals, generateInvitationCode } from '../../server/utils'
import { escape as SQLEscape } from 'sqlstring'
import parse from '../../server/parse'

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
   * Returns an encrypted hash of a string.
   * @param orig {string} - The string to hash.
   * @returns {string} - The encrypted hash of the original string.
   */

  static hash (orig) {
    return bcrypt.hashSync(orig, bcrypt.genSaltSync(8), null)
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
    this.name = name
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
      const fields = [
        { name: 'name', type: 'string' },
        { name: 'email', type: 'string' }
      ]

      if (vals.password) {
        vals.password = Member.hash(vals.password)
        vals.reset = 0
        fields.push({ name: 'password', type: 'string' })
        fields.push({ name: 'reset', type: 'number' })
        this.password = vals.password
      }

      const query = updateVals(fields, vals)
      await db.run(`UPDATE members SET ${query} WHERE id=${this.id};`)
      this.name = vals.name
      this.email = vals.email
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
   * Generates a random password, hashes it, saves the hash to the database,
   * flags the user as needing to reset her password, and then returns the
   * random password that it generated.
   * @param db {Pool} - A database connection.
   * @returns {Promise} - A promise that resolves with the generated password
   *   once the database has been updated.
   */

  async generateRandomPassword (db) {
    const password = Math.random().toString(36).replace('0.', '')
    const hash = Member.hash(password)
    await db.run(`UPDATE members SET password='${hash}', reset=1 WHERE id=${this.id};`)
    this.password = hash
    return password
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

  /**
   * Removes an OAuth2 authentication token for a member.
   * @param service {string} - The service to remove. Can be 'google',
   *   'facebook', 'twitter', 'discord', 'patreon', or 'github'.
   * @param db {Pool} - A database connection.
   */

  async removeAuth (service, db) {
    await db.run(`DELETE FROM authorizations WHERE member=${this.id} AND provider='${service}';`)
  }

  /**
   * Returns an array of the OAuth2 services that the member has an active
   * authentication for in the database.
   * @param db {Pool} - A database connection.
   * @returns {Promise} - A promise that resolves with an array of strings,
   *   each specifying an OAuth2 service that the member has an active
   *   authentication for in the database.
   */

  async getAuth (db) {
    const res = await db.run(`SELECT provider FROM authorizations WHERE member=${this.id};`)
    return res.map(row => row.provider)
  }

  /**
   * Returns a list of all of the OAuth2 services that a member can use to
   * authenticate.
   * @returns {string[]} - An array of strings, each one specifying an OAuth2
   *   service that a member could authenticate with.
   */

  static getAllAuth () {
    return [ 'patreon', 'discord', 'google', 'facebook', 'twitter' ]
  }

  /**
   * Returns the messages left for a member in the database, and then deletes
   * them.
   * @param id {int} - The ID of the member.
   * @param db {Pool} - A database connection.
   * @returns {Promise} - A promise that resolves with an object. Each of the
   *   properties in the object defines a type of message (see `msgTypes` for a
   *   complete list of valid types), and provides an array of messages of that
   *   type.
   */

  static async getMessages (id, db) {
    const messages = await db.run(`SELECT * FROM messages WHERE member=${id}`)
    if (messages.length > 0) {
      const res = {}
      for (const msg of messages) {
        const message = await parse(msg.message, db)
        if (res[msg.type]) {
          res[msg.type] = [...res[msg.type], message]
        } else {
          res[msg.type] = [message]
        }
        db.run(`DELETE FROM messages WHERE id=${msg.id};`)
      }
      return res
    } else {
      return {}
    }
  }

  /**
   * Saves a message for a user.
   * @param type {string} - The type of message being left. See `msgTypes` for
   *   a complete list of valid types.
   * @param msg {string} - The text of the message.
   * @param db {Pool} - A database connection.
   * @returns {Promise} - A promise that resolves when the message has been
   *   saved to the database.
   */

  async logMessage (type, msg, db) {
    const validTypes = Object.keys(msgTypes).map(type => msgTypes[type])
    const checkedType = validTypes.indexOf(type) > -1 ? type : msgTypes.info
    await db.run(`INSERT INTO messages (member, type, message) VALUES (${this.id}, '${checkedType}', ${SQLEscape(msg)});`)
  }

  /**
   * Creates a new invitation.
   * @param email {string} - The email address to invite.
   * @param emailer {function} - A function that can send an email.
   * @param db {Pool} - A database connectionn.
   * @returns {Promise} - A promise that resolves when the invitation is snet.
   */

  async createInvitation (email, emailer, db) {
    const code = await generateInvitationCode(db)
    const account = await db.run(`INSERT INTO members (email) VALUES ('${email}');`)
    await db.run(`INSERT INTO invitations (inviteFrom, inviteTo, inviteCode) VALUES (${this.id}, ${account.insertId}, '${code}');`)
    if (!this.admin) {
      this.invitations = Math.max(this.invitations - 1, 0)
      await db.run(`UPDATE members SET invitations=${this.invitations} WHERE id=${this.id}`)
    }
    await emailer({
      to: email,
      subject: 'Welcome to the Fifth World',
      body: `${this.getName()} has invited you to join the Fifth World. Click here to begin:\n\nhttps://thefifthworld.com/join/${code}`
    })
    await this.logMessage(msgTypes.confirm, `Invitation sent to '''${email}'''.`, db)
  }

  /**
   * Sends a reminder email to someone who has received an invitation but has
   * not yet acccepted it.
   * @param member {Member} - The member who has not yet accepted her
   *   invitation.
   * @param emailer {function} - A function that can send an email.
   * @param db {Pool} - A database connection.
   * @returns {Promise} - A promise that resolves when the reminder email has
   *   been sent.
   */

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

  /**
   * This method evaluates how to handle the request to send an invitation. If
   * someone with the given email address is already a member, a message is
   * logged for the member who tried to invite her. If someone with that email
   * address has already been invited but not yet accepted, a reminder is sent.
   * If no one with that address has yet been invited, a new invitation is
   * created.
   * @param email {string} - The email address to send an invitation to.
   * @param emailer {function} - A function that can send an email.
   * @param db {Pool} - A database connection.
   * @returns {Promise} - A promise that resolves once the request has been
   *   evaluated and handled.
   */

  async sendInvitation (email, emailer, db) {
    if (this.invitations > 0) {
      const existing = await Member.find({ email }, db)
      if (existing) {
        const hasPendingInvitation = await db.run(`SELECT id FROM invitations WHERE inviteTo=${existing.id} AND accepted=0;`)
        if (hasPendingInvitation.length > 0) {
          await this.sendReminder(existing, emailer, db)
        } else {
          await this.logMessage(msgTypes.info, `[/member/${existing.id} ${existing.getName()}] is already a member.`, db)
        }
      } else {
        await this.createInvitation(email, emailer, db)
      }
    } else {
      await this.logMessage(msgTypes.warning, `Sorry, you’ve run out of invitations. No invitation sent to '''${email}'''.`, db)
    }
  }

  /**
   * This method iterates over a list of emails in order and, for each one,
   * evaluates how to handle the request to send an invitation. If someone with
   * that email address is already a member, a message is logged for the member
   * who tried to invite her. If someone with that email address has already
   * been invited but not yet accepted, a reminder is sent. If no one with that
   * address has yet been invited, a new invitation is created.
   * @param inviterId {int} - The ID of the member sending these invitations.
   * @param emails {Array} - An array of strings, where each string is an
   *   email address to send an invitation to.
   * @param emailer {function} - A function that can send an email.
   * @param db {Pool} - A database connection.
   * @returns {Promise} - A promise that resolves once each of the email
   *   addresses provided have been evaluated.
   */

  static async sendInvitations (inviterId, emails, emailer, db) {
    const inviter = await Member.get(inviterId, db)
    for (const email of emails) {
      await inviter.sendInvitation(email, emailer, db)
    }
  }

  /**
   * Returns an array of objects representing the invitations that the member
   * has sent. Each object includes the `id`, `name`, and `accepted` properties
   * for each invitation sent.
   * @param inviterId {int} - The ID of the member who sent the invitations.
   * @param db {Pool} - A database connection.
   * @returns {Promise} - A promise that resolves with an array of objects.
   */

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

  /**
   * This method accepts an invitation.
   * @param code {string} - The invitation code provided.
   * @param db {Pool} - A database connection.
   * @returns {Promise} - A promise that resolves when the invitation has been
   *   accepted.
   */

  static async acceptInvitation (code, db) {
    const check = await db.run(`SELECT m.id FROM members m, invitations i WHERE m.id=i.inviteTo AND i.inviteCode=${code};`)
    if (check.length === 1) {
      const id = check[0].id
      await db.run(`UPDATE invitations SET accepted=1 WHERE inviteTo=${id};`)
      return this.get(id, db)
    } else {
      return null
    }
  }
}

export default Member
