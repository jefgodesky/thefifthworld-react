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
  it('can autocomplete a title', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    await Page.create({
      title: 'Page',
      body: 'This is a page.'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'Paganism',
      body: 'This is paganism!'
    }, member, 'Initial text', db)

    const type1 = await Page.autocomplete('pag', db)
    const type2 = await Page.autocomplete('page', db)
    const actual = [ type1.length, type2.length ]
    const expected = [ 2, 1 ]
    expect(actual).toEqual(expected)
  })

  it('can return paths for a list of titles', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    await Page.create({
      title: 'Page 1',
      body: 'This is a page.'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'Page 2',
      body: 'This is a page.'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'Page 3',
      path: '/cool-new-path',
      body: 'This is a page.'
    }, member, 'Initial text', db)

    const paths = await Page.getPaths([ 'Page 1', 'Page 2', '/cool-new-path' ], db)
    const actual = paths.map(res => res.path)
    const expected = [ '/page-1', '/page-2', '/cool-new-path' ]
    expect(actual).toEqual(expected)
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
