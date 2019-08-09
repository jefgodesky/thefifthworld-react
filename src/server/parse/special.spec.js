/* global describe, it, expect, beforeEach, afterEach, afterAll */

import Member from '../../shared/models/member'
import Page from '../../shared/models/page'
import {
  listChildren,
  listOtherNames,
  listNamesKnown,
  parseTags,
  unwrapDivs
} from './special'
import db from '../db'

beforeEach(async () => {
  const tables = [ 'members', 'pages', 'changes', 'names' ]
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

describe('listOtherNames', () => {
  it('lists other names', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    await Page.create({
      title: 'Alice',
      body: 'This is Alice\'s page. [[Type:Person]]'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'Bob',
      body: 'This is Bob\'s page. [[Type:Person]]'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'Abba Zabba',
      body: 'This is a name that [[Bob]] knows. [[Type:Name]] [[Knower:/bob]]',
      parent: '/alice'
    }, member, 'Initial text', db)
    const actual = await listOtherNames('{{OtherNames}}', '/alice', db)
    const expected = '<section><h3>Abba Zabba</h3><p class="known-to">Known to <a href="/bob">Bob</a>.</p><p>This is a name that <a href="/bob">Bob</a> knows. </p></section>'
    expect(actual).toEqual(expected)
  })
})

describe('listNamesKnown', () => {
  it('lists names known', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    await Page.create({
      title: 'Alice',
      body: 'This is Alice\'s page. [[Type:Person]]'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'Bob',
      body: 'This is Bob\'s page. [[Type:Person]]'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'Abba Zabba',
      body: 'This is a name that [[Bob]] knows. [[Type:Name]] [[Knower:/bob]]',
      parent: '/alice'
    }, member, 'Initial text', db)
    const actual = await listNamesKnown('{{NamesKnown}}', '/bob', db)
    const expected = '<table><thead><tr><th>Person or place</th><th>Known as</th></tr></thead><tbody><tr><td><a href="/alice">Alice</a></td><td><a href="/alice/abba-zabba">Abba Zabba</a></td></tr></tbody></table>'
    expect(actual).toEqual(expected)
  })

  it('listens to tag attributes', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    await Page.create({
      title: 'Alice',
      body: 'This is Alice\'s page. [[Type:Person]]'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'Bob',
      body: 'This is Bob\'s page. [[Type:Person]]'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'Abba Zabba',
      body: 'This is a name that [[Bob]] knows. [[Type:Name]] [[Knower:/bob]]',
      parent: '/alice'
    }, member, 'Initial text', db)
    const actual = await listNamesKnown('{{NamesKnown path="/bob"}}', '/alice', db)
    const expected = '<table><thead><tr><th>Person or place</th><th>Known as</th></tr></thead><tbody><tr><td><a href="/alice">Alice</a></td><td><a href="/alice/abba-zabba">Abba Zabba</a></td></tr></tbody></table>'
    expect(actual).toEqual(expected)
  })
})

describe('parseTags', () => {
  it('hides tags in wikitext', () => {
    const actual = parseTags('This has [[Knower:2]] some text. [[Location:40.441848, -80.012827]] [[Owner:2]] And some more text after it, too. [[Type:Test]]')
    const expected = 'This has some text. And some more text after it, too.'
    expect(actual).toEqual(expected)
  })
})

describe('unwrapDivs', () => {
  it('unwraps a single div inside of a p', () => {
    const actual = unwrapDivs('<p><div>Hello</div></p>')
    expect(actual).toEqual('<div>Hello</div>')
  })

  it('can handle p tags with attributes', () => {
    const actual = unwrapDivs('<p class="test" data-test="true"><div>Hello</div></p>')
    expect(actual).toEqual('<div>Hello</div>')
  })

  it('preserves div attributes', () => {
    const actual = unwrapDivs('<p><div class="test" data-test="true">Hello</div></p>')
    expect(actual).toEqual('<div class="test" data-test="true">Hello</div>')
  })

  it('unwraps multiple div tags inside of a p', () => {
    const actual = unwrapDivs('<p><div>1</div> <div>2</div></p>')
    expect(actual).toEqual('<div>1</div> <div>2</div>')
  })

  it('doesn\'t unwrap if there\'s something besides div tags inside the p', () => {
    const actual = unwrapDivs('<p><div>1</div> <div>2</div> 3</p>')
    expect(actual).toEqual('<p><div>1</div> <div>2</div> 3</p>')
  })
})

afterEach(async () => {
  const tables = [ 'members', 'pages', 'changes', 'names' ]
  for (const table of tables) {
    await db.run(`DELETE FROM ${table};`)
    await db.run(`ALTER TABLE ${table} AUTO_INCREMENT=1;`)
  }
})

afterAll(() => {
  db.end()
})
