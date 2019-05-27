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
  it('returns an error when a new page uses a reserved path', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    try {
      await Page.create({
        title: 'New Page',
        body: 'This is a new page.',
        path: '/login'
      }, member, 'Initial text', db)
      expect(false).toEqual(true)
    } catch (err) {
      expect(err.toString()).toEqual('Error: /login is a reserved path.')
    }
  })

  it('returns an error when a new page uses an existing path', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    await Page.create({
      title: 'New Page',
      body: 'This is a new page.',
      path: '/new-page'
    }, member, 'Initial text', db)
    try {
      await Page.create({
        title: 'New Page',
        body: 'This is a new page.',
        path: '/new-page'
      }, member, 'Initial text', db)
      expect(false).toEqual(true)
    } catch (err) {
      expect(err.code).toEqual('ER_DUP_ENTRY')
    }
  })

  it('can figure out a path', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const parent = await Page.create({
      title: 'Parent Page',
      body: 'This is the parent page.'
    }, member, 'Initial text', db)

    const actual = []
    actual.push(await Page.getPath({ title: 'Child Page' }, 0, db))
    actual.push(await Page.getPath({ title: 'Child Page' }, parent, db))
    actual.push(await Page.getPath({ title: 'Child Page' }, parent.id, db))

    const child = await Page.create({
      parent,
      title: 'Child Page',
      body: 'This is the child page.'
    }, member, 'Initial text', db)
    actual.push(await Page.getPath({ title: 'Grandchild Page' }, child, db))

    const expected = [
      '/child-page',
      '/parent-page/child-page',
      '/parent-page/child-page',
      '/parent-page/child-page/grandchild-page'
    ]
    expect(actual).toEqual(expected)
  })

  it('updates the slug if you update the path', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const page = await Page.create({
      title: 'Page',
      body: 'This is a test page.'
    }, member, 'Initial text', db)

    await page.update({
      path: '/something/something/new-path'
    }, member, 'Changing path', db)

    expect([ page.path, page.slug ]).toEqual([ '/something/something/new-path', 'new-path' ])
  })

  it('returns an error when you edit a page to use a reserved path', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const page = await Page.create({
      title: 'New Page',
      body: 'This is a new page.'
    }, member, 'Initial text', db)
    try {
      await page.update({
        path: '/login'
      }, member, 'Can we make this /login?', db)
      expect(false).toEqual(true)
    } catch (err) {
      expect(err.toString()).toEqual('Error: /login is a reserved path.')
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
