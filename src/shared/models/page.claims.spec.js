/* global describe, it, expect, beforeEach, afterEach, afterAll */

import Member from './member'
import Page from './page'
import db from '../../server/db'

beforeEach(async () => {
  const tables = [ 'members', 'pages', 'changes' ]
  for (const table of tables) {
    await db.run(`DELETE FROM ${table};`)
    await db.run(`ALTER TABLE ${table} AUTO_INCREMENT=1;`)
  }

  await db.run('INSERT INTO members (name, email, admin) VALUES (\'Admin\', \'admin@thefifthworld.com\', 1);')
  await db.run('INSERT INTO members (name, email) VALUES (\'Normal\', \'normal@thefifthworld.com\');')
})

describe('Page', () => {
  it('can extract a claim from the wikitext', () => {
    const claim = Page.getClaim('This is a member\'s page. [[Owner:2]]')
    expect(claim).toEqual(2)
  })

  it('can extract a claim with space (A)', () => {
    const claim = Page.getClaim('This is a member\'s page. [[Owner: 2]]')
    expect(claim).toEqual(2)
  })

  it('can extract a claim with space (B)', () => {
    const claim = Page.getClaim('This is a member\'s page. [[Owner: 2 ]]')
    expect(claim).toEqual(2)
  })

  it('returns null if you try to get a claim when there isn\'t one to get', () => {
    const claim = Page.getClaim('This is a member\'s page.')
    expect(claim).toEqual(null)
  })

  it('returns null if you try to get a claim when it isn\'t a number', () => {
    const claim = Page.getClaim('This is a member\'s page. [[Owner:Someone]]')
    expect(claim).toEqual(null)
  })

  it('extracts the first claim if there are multiple tags', () => {
    const claim = Page.getClaim('This is a member\'s page. [[Owner:2]] [[Owner:3]]')
    expect(claim).toEqual(2)
  })

  it('lets a member claim a page', async () => {
    expect.assertions(1)
    const admin = await Member.get(1, db)
    const page = await Page.create({
      title: 'New Page',
      body: 'This is a member\'s page. [[Owner:2]]'
    }, admin, 'Initial text', db)
    expect(page.claim).toEqual(2)
  })

  it('lets a member update a page to claim it', async () => {
    expect.assertions(1)
    const admin = await Member.get(1, db)
    const page = await Page.create({
      title: 'New Page',
      body: 'This is a member\'s page.'
    }, admin, 'Initial text', db)
    try {
      await page.update({
        title: 'New Page',
        body: 'This is a member\'s page. [[Owner:2]]'
      }, admin, 'Member #2 claims it.', db)
      expect(page.claim).toEqual(2)
    } catch (err) {
      console.error(err)
      expect(err).toEqual(null)
    }
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
