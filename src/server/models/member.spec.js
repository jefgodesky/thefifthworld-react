/* global describe, it, expect, afterAll */

import Member from './member'
import db from '../db'

describe('Member', () => {
  it('can return a member', () => {
    expect.assertions(1)
    return Member.get(1, db)
      .then(member => {
        const expected = 'Member #1: Jason Godesky <jason@thefifthworld.com>'
        const actual = `${member.constructor.name} #${member.id}: ${member.name} <${member.email}>`
        expect(actual).toEqual(expected)
      })
      .catch(err => {
        console.error(err)
        expect(0).toBe(1)
      })
  })

  it('can find a member', () => {
    expect.assertions(1)
    return Member.find({ 'email': 'jason@thefifthworld.com' }, db)
      .then(records => {
        expect(records.constructor.name).toEqual('Member')
      })
      .catch(err => {
        console.error(err)
        expect(0).toBe(1)
      })
  })

  it('can return a member\'s ID', () => {
    expect.assertions(1)
    return Member.get(1, db)
      .then(member => {
        expect(member.getId()).toEqual(1)
      })
      .catch(err => {
        console.error(err)
        expect(0).toBe(1)
      })
  })

  it('can return the member\'s name', () => {
    expect.assertions(1)
    return Member.get(1, db)
      .then(member => {
        expect(member.getName()).toEqual('Jason Godesky')
      })
      .catch(err => {
        console.error(err)
        expect(0).toBe(1)
      })
  })

  it('can send an invitation', () => {
    expect.assertions(1)

    // Email sender mockup
    const sender = () => {
      return new Promise(resolve => { resolve() })
    }

    return Member.get(1, db)
      .then(admin => {
        return admin.invite('robin@thefifthworld.com', db, sender)
      })
      .then(invited => {
        expect(invited.email).toEqual('robin@thefifthworld.com')
        return db.q(`SELECT id, inviteTo FROM invitations WHERE id=${invited.inviteId}`)
      })
      .then(invite => {
        const m = db.q(`DELETE FROM members WHERE id=${invite[0].inviteTo}`)
        const i = db.q(`DELETE FROM invitations WHERE id=${invite[0].id}`)
        return Promise.all([m, i])
      })
      .catch(err => {
        console.error(err)
        expect(0).toBe(1)
      })
  })

  it('sends a reminder if there\'s already an invitation out', () => {
    expect.assertions(1)
    let inviter = null

    // Email sender mockup
    const sender = () => {
      return new Promise(resolve => { resolve() })
    }

    return Member.get(1, db)
      .then(admin => {
        inviter = admin
        return admin.invite('robin@thefifthworld.com', db, sender)
      })
      .then(() => {
        return inviter.invite('robin@thefifthworld.com', db, sender)
      })
      .then(() => {
        expect(1).toEqual(1)
        return db.q(`SELECT i.id, i.inviteTo FROM invitations i, members m WHERE m.email='robin@thefifthworld.com' AND i.inviteFrom=${inviter.getId()} AND i.inviteTo = m.id`)
      })
      .then(invite => {
        const m = db.q(`DELETE FROM members WHERE id=${invite[0].inviteTo}`)
        const i = db.q(`DELETE FROM invitations WHERE id=${invite[0].id}`)
        return Promise.all([m, i])
      })
      .catch(err => {
        console.error(err)
        expect(0).toBe(1)
      })
  })
})

afterAll(() => {
  db.end()
})
