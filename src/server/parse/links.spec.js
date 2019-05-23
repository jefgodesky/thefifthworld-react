/* global describe, it, expect, beforeEach, afterEach, afterAll */

import Member from '../../shared/models/member'
import Page from '../../shared/models/page'
import parseLinks from './links'
import db from '../db'

beforeEach(async () => {
  const tables = [ 'members', 'pages', 'changes' ]
  for (const table of tables) {
    await db.run(`DELETE FROM ${table};`)
    await db.run(`ALTER TABLE ${table} AUTO_INCREMENT=1;`)
  }

  await db.run('INSERT INTO members (name, email, admin) VALUES (\'Admin\', \'admin@thefifthworld.com\', 1);')
  await db.run('INSERT INTO members (name, email) VALUES (\'Normal\', \'normal@thefifthworld.com\');')
})

describe('parseLinks', () => {
  it('links to a page', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    await Page.create({
      title: 'Test Page',
      body: 'This is a new page.'
    }, member, 'Initial text', db)
    const actual = await parseLinks('[[Test Page]]', db)
    expect(actual).toEqual('<a href="/test-page">Test Page</a>')
  })

  it('links to a new page', async () => {
    expect.assertions(1)
    const actual = await parseLinks('[[Test Page]]', db)
    expect(actual).toEqual('<a href="/test-page?create" class="new">Test Page</a>')
  })
})

afterEach(async () => {
  const tables = [ 'members', 'pages', 'changes' ]
  for (const table of tables) {
    await db.run(`DELETE FROM ${table};`)
    await db.run(`ALTER TABLE ${table} AUTO_INCREMENT=1;`)
  }
})

afterAll(() => {
  db.end()
})
