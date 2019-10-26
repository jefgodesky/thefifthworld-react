/* global describe, it, expect, beforeEach, afterEach, afterAll */

import Member from './member'
import Page from './page'
import db from '../../server/db'

beforeEach(async () => {
  await db.run('INSERT INTO members (name, email, admin) VALUES (\'Admin\', \'admin@thefifthworld.com\', 1);')
  await db.run('INSERT INTO members (name, email) VALUES (\'Normal\', \'normal@thefifthworld.com\');')
})

describe('Page', () => {
  it('tags a page\'s type', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const page = await Page.create({
      title: 'Page 1',
      body: 'This is a page. [[Type:Page]]'
    }, member, 'Initial text', db)
    expect(page.type).toEqual('Page')
  })

  it('overrides a page\'s type on creation', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const page = await Page.create({
      title: 'Page 1',
      body: 'This is a page. [[Type:Page]]',
      type: 'Other'
    }, member, 'Initial text', db)
    expect(page.type).toEqual('Other')
  })

  it('overrides a page\'s type on update', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const page = await Page.create({
      title: 'Page 1',
      body: 'This is a page. [[Type:Page]]'
    }, member, 'Initial text', db)
    await page.update({
      type: 'Other'
    }, member, 'Changing type', db)
    expect(page.type).toEqual('Other')
  })

  it('updates a page\'s type', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const page = await Page.create({
      title: 'Page 1',
      body: 'This is a page. [[Type:Page]]'
    }, member, 'Initial text', db)
    await page.update({
      body: 'This is a page. [[Type:Other]]'
    }, member, 'Changing type', db)
    expect(page.type).toEqual('Other')
  })
})

afterEach(async () => {
  const tables = [ 'changes', 'tags', 'places', 'members', 'pages' ]
  for (const table of tables) {
    await db.run(`DELETE FROM ${table};`)
    await db.run(`ALTER TABLE ${table} AUTO_INCREMENT=1;`)
  }
})

afterAll(() => {
  db.end()
})
