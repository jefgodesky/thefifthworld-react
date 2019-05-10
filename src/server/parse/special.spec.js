/* global describe, it, expect */

import Member from '../../shared/models/member'
import Page from '../../shared/models/page'
import {
  listChildren,
  parseLocation
} from './special'
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

describe('listChildren', () => {
  it('lists all of a page\'s children', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    await Page.create({
      title: 'Parent',
      body: 'This is a parent page.'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'First Child',
      body: 'This is a child page.',
      parent: '/parent'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'Second Child',
      body: 'This is another child page.',
      parent: '/parent'
    }, member, 'Initial text', db)
    const actual = await listChildren('{{Children}}', '/parent', db)
    expect(actual).toEqual('<ul>\n<li><a href="/parent/first-child">First Child</a></li>\n<li><a href="/parent/second-child">Second Child</a></li>\n</ul>')
  })

  it('lists all of a page\'s children of a particular type', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    await Page.create({
      title: 'Parent',
      body: 'This is a parent page.'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'First Child',
      body: 'This is a child page. [[Type:Tagged]]',
      parent: '/parent'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'Second Child',
      body: 'This is another child page.',
      parent: '/parent'
    }, member, 'Initial text', db)
    const actual = await listChildren('{{Children type="Tagged"}}', '/parent', db)
    expect(actual).toEqual('<ul>\n<li><a href="/parent/first-child">First Child</a></li>\n</ul>')
  })

  it('can limit the list of a page\'s children', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    await Page.create({
      title: 'Parent',
      body: 'This is a parent page.'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'First Child',
      body: 'This is a child page.',
      parent: '/parent'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'Second Child',
      body: 'This is another child page.',
      parent: '/parent'
    }, member, 'Initial text', db)
    const actual = await listChildren('{{Children limit="1"}}', '/parent', db)
    expect(actual).toEqual('<ul>\n<li><a href="/parent/first-child">First Child</a></li>\n</ul>')
  })

  it('can show a different page\'s children', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    await Page.create({
      title: 'Parent',
      body: 'This is a parent page.'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'First Child',
      body: 'This is a child page.',
      parent: '/parent'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'Second Child',
      body: 'This is another child page.',
      parent: '/parent'
    }, member, 'Initial text', db)
    const actual = await listChildren('{{Children limit="1" of="/parent"}}', '/second-child', db)
    expect(actual).toEqual('<ul>\n<li><a href="/parent/first-child">First Child</a></li>\n</ul>')
  })

  it('can list children in reverse chronological order', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    await Page.create({
      title: 'Parent',
      body: 'This is a parent page.'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'First Child',
      body: 'This is a child page.',
      parent: '/parent'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'Second Child',
      body: 'This is another child page.',
      parent: '/parent'
    }, member, 'Initial text', db)
    const actual = await listChildren('{{Children order="newest"}}', '/parent', db)
    expect(actual).toEqual('<ul>\n<li><a href="/parent/second-child">Second Child</a></li>\n<li><a href="/parent/first-child">First Child</a></li>\n</ul>')
  })

  it('can list children in alphabetical order', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    await Page.create({
      title: 'Parent',
      body: 'This is a parent page.'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'Bob',
      body: 'This is a child page.',
      parent: '/parent'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'Alice',
      body: 'This is another child page.',
      parent: '/parent'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'Charlie',
      body: 'This is also a child page.',
      parent: '/parent'
    }, member, 'Initial text', db)
    const actual = await listChildren('{{Children order="alphabetical"}}', '/parent', db)
    expect(actual).toEqual('<ul>\n<li><a href="/parent/alice">Alice</a></li>\n<li><a href="/parent/bob">Bob</a></li>\n<li><a href="/parent/charlie">Charlie</a></li>\n</ul>')
  })
})

describe('parseLocation', () => {
  it('hides location tag in wikitext', () => {
    const actual = parseLocation('This has some text. [[Location:40.441848, -80.012827]] And some more text after it, too.')
    const expected = 'This has some text. And some more text after it, too.'
    expect(actual).toEqual(expected)
  })

  it('hides all location tags', () => {
    const actual = parseLocation('This has [[Location:40.441848, -80.012827]] some text. [[Location:40.441848, -80.012827]] And some more text [[Location:40.441848, -80.012827]] after it, too.')
    const expected = 'This has some text. And some more text after it, too.'
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
