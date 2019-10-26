/* global describe, it, expect, beforeEach, afterEach, afterAll */

import Member from './member'
import Page from './page'
import db from '../../server/db'

beforeEach(async () => {
  await db.run('INSERT INTO members (name, email, admin) VALUES (\'Admin\', \'admin@thefifthworld.com\', 1);')
  await db.run('INSERT INTO members (name, email) VALUES (\'Normal\', \'normal@thefifthworld.com\');')
})

describe('Page', () => {
  it('returns an error when a new page uses a reserved template name', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    try {
      await Page.create({
        title: 'Artists',
        body: 'This is a new page. [[Type:Template]]',
        path: '/artists'
      }, member, 'Initial text', db)
      expect(false).toEqual(true)
    } catch (err) {
      expect(err.toString()).toEqual('Error: {{Artists}} is used internally. You cannot create a template with that name.')
    }
  })

  it('returns an error when you edit a page to use a reserved template name', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const page = await Page.create({
      title: 'New Page',
      body: 'This is a new page.'
    }, member, 'Initial text', db)
    try {
      await page.update({
        title: 'Artists',
        body: 'This is a new page. [[Type:Template]]'
      }, member, 'Edit to {{Artists}}', db)
      expect(false).toEqual(true)
    } catch (err) {
      expect(err.toString()).toEqual('Error: {{Artists}} is used internally. You cannot create a template with that name.')
    }
  })
})

afterEach(async () => {
  const tables = [ 'changes', 'members', 'pages' ]
  for (const table of tables) {
    await db.run(`DELETE FROM ${table};`)
    await db.run(`ALTER TABLE ${table} AUTO_INCREMENT=1;`)
  }
})

afterAll(() => {
  db.end()
})
