/* global describe, it, expect, beforeEach, afterEach, afterAll */

import { escape as SQLEscape } from 'sqlstring'
import Member from './member'
import Page from './page'
import db from '../../server/db'

beforeEach(async () => {
  await db.run('ALTER TABLE members AUTO_INCREMENT=1;')
  await db.run('INSERT INTO members (name, email, admin) VALUES (\'Admin\', \'admin@thefifthworld.com\', 1);')
  await db.run('INSERT INTO members (name, email) VALUES (\'Normal\', \'normal@thefifthworld.com\');')
  await db.run('INSERT INTO authorizations (member, provider, oauth2_id, oauth2_token) VALUES (1, \'test\', \'id\', \'token\');')
})

describe('Member', () => {
  it('can return a member', async () => {
    expect.assertions(1)
    const member = await Member.get(1, db)
    const expected = 'Member #1: Admin <admin@thefifthworld.com>'
    const actual = `${member.constructor.name} #${member.id}: ${member.name} <${member.email}>`
    expect(actual).toEqual(expected)
  })

  it('can find a member', async () => {
    expect.assertions(1)
    const member = await Member.find({ 'email': 'normal@thefifthworld.com' }, db)
    const expected = 'Member #2: Normal <normal@thefifthworld.com>'
    const actual = `${member.constructor.name} #${member.id}: ${member.name} <${member.email}>`
    expect(actual).toEqual(expected)
  })

  it('can find the member for an OAuth token', async () => {
    expect.assertions(1)
    const member = await Member.findAuth('test', 'id', db)
    const expected = 'Member #1: Admin <admin@thefifthworld.com>'
    const actual = `${member.constructor.name} #${member.id}: ${member.name} <${member.email}>`
    expect(actual).toEqual(expected)
  })

  it('returns false when no such OAuth token is on record', async () => {
    expect.assertions(1)
    const member = await Member.findAuth('test_service', 'nothere', db)
    expect(member).toEqual(false)
  })

  it('controls permissions on who can edit a member profile', async () => {
    expect.assertions(1)
    const admin = await Member.get(1, db)
    const member = await Member.get(2, db)
    const memberEditsSelf = Member.canEdit(member, member)
    const memberEditsAdmin = Member.canEdit(admin, member)
    const adminEditsSelf = Member.canEdit(admin, admin)
    const adminEditsMember = Member.canEdit(member, admin)
    const expected = [ true, false, true, true ]
    const actual = [ memberEditsSelf, memberEditsAdmin, adminEditsSelf, adminEditsMember ]
    expect(actual).toEqual(expected)
  })

  it('can return a member\'s ID', async () => {
    expect.assertions(1)
    const member = await Member.get(1, db)
    expect(member.getId()).toEqual(1)
  })

  it('can return the member\'s name', async () => {
    expect.assertions(1)
    await db.run('INSERT INTO members (email) VALUES (\'nameless@thefifthworld.com\');')
    await db.run('INSERT INTO members () VALUES ();')
    const admin = await Member.get(1, db)
    const email = await Member.get(3, db)
    const nothing = await Member.get(4, db)
    const expected = [ 'Admin', 'nameless@thefifthworld.com', 'Member #4' ]
    const actual = [ admin.getName(), email.getName(), nothing.getName() ]
    expect(actual).toEqual(expected)
  })

  it('can set a member name', async () => {
    expect.assertions(1)
    const admin = await Member.get(1, db)
    await admin.setName('New Name', db)
    const after = await Member.get(1, db)
    const expected = 'New Name New Name'
    const actual = `${admin.getName()} ${after.getName()}`
    expect(actual).toEqual(expected)
  })

  it('can return an object', async () => {
    expect.assertions(1)
    const admin = await Member.get(1, db)
    const expected = {
      id: 1,
      name: 'Admin',
      email: 'admin@thefifthworld.com',
      active: true,
      admin: true
    }
    expect(admin.getObject()).toEqual(expected)
  })

  it('can update a member', async () => {
    expect.assertions(1)
    const admin = await Member.get(1, db)
    const member = await Member.get(2, db)
    const checks = []
    let update

    // Admin can update herself
    await admin.update({
      name: 'Checkpoint A',
      bio: 'Checkpoint A',
      facebook: 'Checkpoint A',
      twitter: 'Checkpoint A',
      github: 'Checkpoint A',
      patreon: 'Checkpoint A',
      web: 'Checkpoint A'
    }, admin.getObject(), db)
    update = await Member.get(1, db)
    checks.push(update.name === 'Checkpoint A')
    checks.push(update.bio === 'Checkpoint A')
    checks.push(update.facebook === 'Checkpoint A')
    checks.push(update.twitter === 'Checkpoint A')
    checks.push(update.github === 'Checkpoint A')
    checks.push(update.patreon === 'Checkpoint A')
    checks.push(update.web === 'Checkpoint A')

    // Admin can update a member
    await member.update({
      name: 'Checkpoint B',
      bio: 'Checkpoint B',
      facebook: 'Checkpoint B',
      twitter: 'Checkpoint B',
      github: 'Checkpoint B',
      patreon: 'Checkpoint B',
      web: 'Checkpoint B'
    }, admin.getObject(), db)
    update = await Member.get(2, db)
    checks.push(update.name === 'Checkpoint B')
    checks.push(update.bio === 'Checkpoint B')
    checks.push(update.facebook === 'Checkpoint B')
    checks.push(update.twitter === 'Checkpoint B')
    checks.push(update.github === 'Checkpoint B')
    checks.push(update.patreon === 'Checkpoint B')
    checks.push(update.web === 'Checkpoint B')

    // Member can update herself
    await member.update({
      name: 'Checkpoint C',
      bio: 'Checkpoint C',
      facebook: 'Checkpoint C',
      twitter: 'Checkpoint C',
      github: 'Checkpoint C',
      patreon: 'Checkpoint C',
      web: 'Checkpoint C'
    }, member.getObject(), db)
    update = await Member.get(2, db)
    checks.push(update.name === 'Checkpoint C')
    checks.push(update.bio === 'Checkpoint C')
    checks.push(update.facebook === 'Checkpoint C')
    checks.push(update.twitter === 'Checkpoint C')
    checks.push(update.github === 'Checkpoint C')
    checks.push(update.patreon === 'Checkpoint C')
    checks.push(update.web === 'Checkpoint C')

    // Member CANNOT update an admin
    await admin.update({
      name: 'Checkpoint D',
      bio: 'Checkpoint D',
      facebook: 'Checkpoint D',
      twitter: 'Checkpoint D',
      github: 'Checkpoint D',
      patreon: 'Checkpoint D',
      web: 'Checkpoint D'
    }, member.getObject(), db)
    update = await Member.get(1, db)
    checks.push(update.name === 'Checkpoint A')
    checks.push(update.bio === 'Checkpoint A')
    checks.push(update.facebook === 'Checkpoint A')
    checks.push(update.twitter === 'Checkpoint A')
    checks.push(update.github === 'Checkpoint A')
    checks.push(update.patreon === 'Checkpoint A')
    checks.push(update.web === 'Checkpoint A')

    // Can set a passphrase
    const password = 'New passphrase'
    await member.update({ password }, member.getObject(), db)
    checks.push(await member.checkPass(password))

    expect(checks.reduce((res, check) => res && check)).toEqual(true)
  })

  it('can generate a random password', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const checks = []

    // Generate random password
    const random = await member.generateRandomPassword(db)
    checks.push(await member.checkPass(random))

    // Is member now flagged as needing to reset her password?
    const afterRandom = await db.run(`SELECT reset FROM members WHERE id=${member.id};`)
    checks.push(afterRandom.length > 0 && afterRandom[0].reset === 1)

    // Update with a new password
    const password = 'New passphrase'
    await member.update({ password }, member.getObject(), db)
    checks.push(await member.checkPass(password))

    // And is that reset flag cleared now?
    const afterUpdate = await db.run(`SELECT reset FROM members WHERE id=${member.id};`)
    checks.push(afterUpdate.length > 0 && afterUpdate[0].reset === 0)

    expect(checks.reduce((res, check) => res && check)).toEqual(true)
  })

  it('can add an OAuth token', async () => {
    expect.assertions(1)
    const admin = await Member.get(1, db)
    await admin.addAuth('new-service', 'id', 'token', db)
    const check = await Member.findAuth('new-service', 'id', db)
    expect(check.getObject()).toEqual(admin.getObject())
  })

  it('can remove an OAuth token', async () => {
    expect.assertions(1)
    const admin = await Member.get(1, db)
    await admin.addAuth('new-service', 'id', 'token', db)
    await admin.removeAuth('new-service', db)
    const actual = await admin.getAuth(db)
    expect(actual.indexOf('new-service')).toEqual(-1)
  })

  it('can log and retrieve messages', async () => {
    expect.assertions(1)
    const confirmation = 'confirmation message confirmed'
    const error = 'ERR'
    const warning = 'consider this a warning'
    const info = 'fyi, this is an informational message'
    const invalid = 'this is a message of an invalid type'

    const admin = await Member.get(1, db)
    await admin.logMessage('confirmation', confirmation, db)
    await admin.logMessage('error', error, db)
    await admin.logMessage('warning', warning, db)
    await admin.logMessage('info', info, db)
    await admin.logMessage('invalid', invalid, db)

    const actual = await Member.getMessages(admin.id, null, db)
    const expected = {
      confirmation: [ `<p>${confirmation}</p>` ],
      error: [ `<p>${error}</p>` ],
      warning: [ `<p>${warning}</p>` ],
      info: [ `<p>${info}</p>`, `<p>${invalid}</p>` ]
    }

    expect(actual).toEqual(expected)
  })

  it('shows messages specified by query params', async () => {
    expect.assertions(1)
    const admin = await Member.get(1, db)
    const actual = await Member.getMessages(admin.id, '/something?msg=save-form-received', db)
    const expected = {
      confirmation: [ '<p>Thanks for your response!</p>' ]
    }
    expect(actual).toEqual(expected)
  })

  it('shows messages specified by query params for people who aren\'t logged in', async () => {
    expect.assertions(1)
    const actual = await Member.getMessages(null, '/something?msg=save-form-received', db)
    const expected = {
      confirmation: [ '<p>Thanks for your response!</p>' ]
    }
    expect(actual).toEqual(expected)
  })

  it('lets an admin create infinite invitations', async () => {
    expect.assertions(1)
    const admin = await Member.get(1, db)
    const emailer = () => false
    const before = admin.invitations

    await admin.createInvitation('test1@thefifthworld.com', emailer, db)
    await admin.createInvitation('test2@thefifthworld.com', emailer, db)
    await admin.createInvitation('test3@thefifthworld.com', emailer, db)

    expect(before).toEqual(admin.invitations)
  })

  it('can invite new members', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const emailer = () => false
    const before = member.invitations

    await member.createInvitation('test1@thefifthworld.com', emailer, db)
    await member.createInvitation('test2@thefifthworld.com', emailer, db)
    await member.createInvitation('test3@thefifthworld.com', emailer, db)

    expect(before - 3).toEqual(member.invitations)
  })

  it('can send invitation reminders', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const emailer = () => false

    await member.createInvitation('test1@thefifthworld.com', emailer, db)
    const invited = await Member.get(3, db)
    await member.sendReminder(invited, emailer, db)

    const actual = await Member.getMessages(member.id, null, db)
    const expected = {
      confirmation: [
        '<p>Invitation sent to <strong>test1@thefifthworld.com</strong>.</p>',
        '<p><strong>test1@thefifthworld.com</strong> already had an invitation, so we sent a reminder.</p>'
      ]
    }
    expect(actual).toEqual(expected)
  })

  it('can figure out how to handle invitations', async () => {
    expect.assertions(1)
    const admin = await Member.get(1, db)
    const member = await Member.get(2, db)
    const emailer = () => false

    await admin.sendInvitation('normal@thefifthworld.com', emailer, db)
    await admin.sendInvitation('test1@thefifthworld.com', emailer, db)

    await member.sendInvitation('admin@thefifthworld.com', emailer, db)
    await member.sendInvitation('test1@thefifthworld.com', emailer, db)
    await member.sendInvitation('test2@thefifthworld.com', emailer, db)
    await member.sendInvitation('test3@thefifthworld.com', emailer, db)
    await member.sendInvitation('test4@thefifthworld.com', emailer, db)
    await member.sendInvitation('test5@thefifthworld.com', emailer, db)
    await member.sendInvitation('test6@thefifthworld.com', emailer, db)
    await member.sendInvitation('test7@thefifthworld.com', emailer, db)

    const adminMsg = await Member.getMessages(admin.id, null, db)
    const memberMsg = await Member.getMessages(member.id, null, db)

    const actual = {
      adminMsg,
      memberMsg,
      adminInvites: admin.invitations,
      memberInvites: member.invitations
    }

    const expected = {
      adminMsg: {
        confirmation: [
          '<p>Invitation sent to <strong>test1@thefifthworld.com</strong>.</p>'
        ],
        info: [
          '<p><a href="/member/2">Normal</a> is already a member.</p>'
        ]
      },
      memberMsg: {
        confirmation: [
          '<p><strong>test1@thefifthworld.com</strong> already had an invitation, so we sent a reminder.</p>',
          '<p>Invitation sent to <strong>test2@thefifthworld.com</strong>.</p>',
          '<p>Invitation sent to <strong>test3@thefifthworld.com</strong>.</p>',
          '<p>Invitation sent to <strong>test4@thefifthworld.com</strong>.</p>',
          '<p>Invitation sent to <strong>test5@thefifthworld.com</strong>.</p>',
          '<p>Invitation sent to <strong>test6@thefifthworld.com</strong>.</p>'
        ],
        info: [
          '<p><a href="/member/1">Admin</a> is already a member.</p>'
        ],
        warning: [
          '<p>Sorry, you’ve run out of invitations. No invitation sent to <strong>test7@thefifthworld.com</strong>.</p>'
        ]
      },
      adminInvites: 5,
      memberInvites: 0
    }

    expect(actual).toEqual(expected)
  })

  it('can send several invitations', async () => {
    expect.assertions(1)

    const addresses = [
      'test1@thefifthworld.com',
      'test2@thefifthworld.com',
      'test3@thefifthworld.com',
      'test4@thefifthworld.com',
      'test5@thefifthworld.com',
      'test6@thefifthworld.com'
    ]

    await Member.sendInvitations(2, addresses, () => false, db)
    const actual = await Member.getMessages(2, null, db)
    const expected = {
      confirmation: [
        '<p>Invitation sent to <strong>test1@thefifthworld.com</strong>.</p>',
        '<p>Invitation sent to <strong>test2@thefifthworld.com</strong>.</p>',
        '<p>Invitation sent to <strong>test3@thefifthworld.com</strong>.</p>',
        '<p>Invitation sent to <strong>test4@thefifthworld.com</strong>.</p>',
        '<p>Invitation sent to <strong>test5@thefifthworld.com</strong>.</p>'
      ],
      warning: [
        '<p>Sorry, you’ve run out of invitations. No invitation sent to <strong>test6@thefifthworld.com</strong>.</p>'
      ]
    }
    expect(actual).toEqual(expected)
  })

  it('can accept an invitation', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    await member.sendInvitation('test@thefifthworld.com', () => false, db)
    const invite = await db.run('SELECT i.inviteCode, i.id FROM invitations i, members m WHERE i.inviteTo=m.id AND m.email=\'test@thefifthworld.com\';')
    if (invite.length === 1) {
      await Member.acceptInvitation(SQLEscape(invite[0].inviteCode), db)
      const check = await db.run(`SELECT accepted FROM invitations WHERE id=${invite[0].id} AND accepted=1;`)
      expect(check.length).toEqual(1)
    } else {
      expect(invite.length).toEqual(1)
    }
  })

  it('can return who you have invited', async () => {
    expect.assertions(1)
    const invitations = [
      'test1@thefifthworld.com',
      'test2@thefifthworld.com'
    ]
    await Member.sendInvitations(2, invitations, () => false, db)
    const invite = await db.run('SELECT i.inviteCode, i.id FROM invitations i, members m WHERE i.inviteTo=m.id AND m.email=\'test1@thefifthworld.com\';')
    if (invite.length === 1) {
      await Member.acceptInvitation(SQLEscape(invite[0].inviteCode), db)
      const actual = await Member.getInvited(2, db)
      const expected = [
        { id: 3, name: 'test1@thefifthworld.com', accepted: true },
        { id: 4, name: 'test2@thefifthworld.com', accepted: false }
      ]
      expect(actual).toEqual(expected)
    } else {
      expect(invite.length).toEqual(1)
    }
  })

  it('can return a list of all OAuth services possible', () => {
    const expected = [ 'patreon', 'discord', 'google', 'facebook', 'twitter' ]
    const actual = Member.getAllAuth()
    expect(actual).toEqual(expected)
  })

  it('can return the OAuth services that the member has authenticated with', async () => {
    expect.assertions(1)
    const admin = await Member.get(1, db)
    const actual = await admin.getAuth(db)
    const expected = [ 'test' ]
    expect(actual).toEqual(expected)
  })

  it('can return a list of pages that the member has claimed', async () => {
    expect.assertions(1)
    const admin = await Member.get(1, db)
    const member = await Member.get(2, db)
    await Page.create({
      title: 'Page 1',
      body: 'This is a member\'s page. [[Owner:2]]'
    }, admin, 'Initial text', db)
    await Page.create({
      title: 'Page 2',
      body: 'This is a member\'s page. [[Owner:2]]'
    }, admin, 'Initial text', db)
    const pages = await member.getClaims(null, db)
    const actual = pages.map(page => page.path)
    expect(actual).toEqual([ '/page-1', '/page-2' ])
  })

  it('can return a list of pages that the member has claimed of a particular type', async () => {
    expect.assertions(1)
    const admin = await Member.get(1, db)
    const member = await Member.get(2, db)
    await Page.create({
      title: 'Page 1',
      body: 'This is a member\'s page. [[Type:A]] [[Owner:2]]',
      path: '/a'
    }, admin, 'Initial text', db)
    await Page.create({
      title: 'Page 2',
      body: 'This is a member\'s page. [[Type:B]] [[Owner:2]]',
      path: '/b'
    }, admin, 'Initial text', db)
    await Page.create({
      title: 'Page 3',
      body: 'This is a member\'s page. [[Type:A]] [[Owner:2]]',
      path: '/c'
    }, admin, 'Initial text', db)
    await Page.create({
      title: 'Page 4',
      body: 'This is a member\'s page. [[Owner:2]]',
      path: '/d'
    }, admin, 'Initial text', db)
    const pages = await member.getClaims('A', db)
    const actual = pages.map(page => page.path)
    expect(actual).toEqual([ '/a', '/c' ])
  })
})

afterEach(async () => {
  const tables = [ 'changes', 'tags', 'pages', 'authorizations', 'messages', 'invitations', 'members' ]
  for (const table of tables) {
    await db.run(`DELETE FROM ${table};`)
    await db.run(`ALTER TABLE ${table} AUTO_INCREMENT=1;`)
  }
})

afterAll(() => {
  db.end()
})
