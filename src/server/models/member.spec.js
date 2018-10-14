/* global describe, it, expect, afterAll */

import Member from './member'
import db from '../db'

describe('Member', () => {
  it('can return a member', async () => {
    expect.assertions(1)
    const member = await Member.get(1, db)
    const expected = 'Member #1: Jason Godesky <jason@thefifthworld.com>'
    const actual = `${member.constructor.name} #${member.id}: ${member.name} <${member.email}>`
    expect(actual).toEqual(expected)
  })

  it('can find a member', async () => {
    expect.assertions(1)
    const records = await Member.find({ 'email': 'jason@thefifthworld.com' }, db)
    expect(records.constructor.name).toEqual('Member')
  })

  it('can return a member\'s ID', async () => {
    expect.assertions(1)
    const member = await Member.get(1, db)
    expect(member.getId()).toEqual(1)
  })

  it('can return the member\'s name', async () => {
    expect.assertions(1)
    const member = await Member.get(1, db)
    expect(member.getName()).toEqual('Jason Godesky')
  })

  it('can send an invitation', async () => {
    expect.assertions(1)

    // Email sender mockup
    const sender = obj => {
      return new Promise(resolve => { resolve(obj) })
    }

    const admin = await Member.get(1, db)
    const invited = await admin.invite('robin@thefifthworld.com', db, sender)
    expect(invited.to).toEqual('robin@thefifthworld.com')

    // Cleanup
    const invite = await db.run(`SELECT id, inviteTo FROM invitations WHERE inviteFrom=1`)
    await db.run(`DELETE FROM members WHERE id=${invite[0].inviteTo}`)
    await db.run(`DELETE FROM invitations WHERE id=${invite[0].id}`)
  })

  it('sends a reminder if there\'s already an invitation out', async () => {
    expect.assertions(1)

    // Email sender mockup
    const sender = () => {
      return new Promise(resolve => { resolve() })
    }

    const admin = await Member.get(1, db)
    await admin.invite('robin@thefifthworld.com', db, sender)
    await admin.invite('robin@thefifthworld.com', db, sender)
    const invitations = await db.run(`SELECT i.id, i.inviteTo FROM invitations i, members m WHERE m.email='robin@thefifthworld.com' AND i.inviteFrom=1 AND i.inviteTo = m.id`)
    expect(invitations.length).toBe(1)

    // Cleanup
    await db.run(`DELETE FROM members WHERE id=${invitations[0].inviteTo}`)
    await db.run(`DELETE FROM invitations WHERE id=${invitations[0].id}`)
  })
})

afterAll(() => {
  db.end()
})
