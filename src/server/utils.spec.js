/* global describe, it, expect, afterAll */

import * as utils from './utils'
import db from './db'

describe('updateVals', () => {
  it('can generate a string for an update statement', () => {
    const actual = utils.updateVals([
      { name: 'stringField', type: 'string' },
      { name: 'numField', type: 'number' }
    ], {
      stringField: 'string value',
      numField: 42
    })
    const expected = `stringField='string value', numField=42`
    expect(actual).toEqual(expected)
  })
})

describe('generateInvitationCode', () => {
  it('generates a unique invitation code', async () => {
    expect.assertions(1)
    const code = await utils.generateInvitationCode(db)
    const check = await db.run(`SELECT COUNT(id) FROM invitations WHERE inviteCode='${code}';`)
    expect(check[0]['COUNT(id)']).toEqual(0)
  })
})

afterAll(() => {
  db.end()
})
