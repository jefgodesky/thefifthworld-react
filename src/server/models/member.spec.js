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
})

afterAll(() => {
  db.end()
})
