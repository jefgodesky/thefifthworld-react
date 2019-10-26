/* global describe, it, expect, beforeEach, afterEach, afterAll */

import Member from './member'
import Page from './page'
import db from '../../server/db'

beforeEach(async () => {
  await db.run('INSERT INTO members (name, email, admin) VALUES (\'Admin\', \'admin@thefifthworld.com\', 1);')
  await db.run('INSERT INTO members (name, email) VALUES (\'Normal\', \'normal@thefifthworld.com\');')
})

describe('Page', () => {
  it('can record a like', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const page = await Page.create({
      title: 'Page 1',
      body: 'This is a page.'
    }, member, 'Initial text', db)
    await page.like(member.id, db)
    const record = await db.run(`SELECT id FROM likes WHERE page = ${page.id} AND member = ${member.id};`)
    const actual = [ record.length, page.likes.length, page.likes.indexOf(member.id) ]
    const expected = [ 1, 1, 0 ]
    expect(actual).toEqual(expected)
  })

  it('can remove a like', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const page = await Page.create({
      title: 'Page 1',
      body: 'This is a page.'
    }, member, 'Initial text', db)
    await page.like(member.id, db)
    await page.unlike(member.id, db)
    const record = await db.run(`SELECT id FROM likes WHERE page = ${page.id} AND member = ${member.id};`)
    const actual = [ record.length, page.likes.length, page.likes.indexOf(member.id) ]
    const expected = [ 0, 0, -1 ]
    expect(actual).toEqual(expected)
  })
})

afterEach(async () => {
  const tables = [ 'changes', 'likes', 'members', 'pages' ]
  for (const table of tables) {
    await db.run(`DELETE FROM ${table};`)
    await db.run(`ALTER TABLE ${table} AUTO_INCREMENT=1;`)
  }
})

afterAll(() => {
  db.end()
})
