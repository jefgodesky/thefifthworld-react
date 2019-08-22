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

  it('can set different link text', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    await Page.create({
      title: 'Test Page',
      body: 'This is a new page.'
    }, member, 'Initial text', db)
    const actual = await parseLinks('[[Test Page | Click here]]', db)
    expect(actual).toEqual('<a href="/test-page">Click here</a>')
  })

  it('links to a new page', async () => {
    expect.assertions(1)
    const actual = await parseLinks('[[Test Page]]', db)
    expect(actual).toEqual('<a href="/new?title=Test%20Page" class="new">Test Page</a>')
  })

  it('links to a new page by path', async () => {
    expect.assertions(1)
    const actual = await parseLinks('[[/test | Test Page]]', db)
    expect(actual).toEqual('<a href="/new?path=%2Ftest" class="new">Test Page</a>')
  })

  it('can link to a path', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    await Page.create({
      title: 'Test Page',
      body: 'This is a new page.'
    }, member, 'Initial text', db)
    const actual = await parseLinks('[[/test-page]]', db)
    expect(actual).toEqual('<a href="/test-page">/test-page</a>')
  })

  it('can link to a path and set different text', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    await Page.create({
      title: 'Test Page',
      body: 'This is a new page.'
    }, member, 'Initial text', db)
    const actual = await parseLinks('[[/test-page | Click here]]', db)
    expect(actual).toEqual('<a href="/test-page">Click here</a>')
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
