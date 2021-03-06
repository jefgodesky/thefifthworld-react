/* global describe, it, expect, beforeEach, afterEach, afterAll */

import Member from '../../shared/models/member'
import Page from '../../shared/models/page'
import {
  escapeCodeBlockMarkdown,
  listChildren,
  parseTags,
  parseForm,
  unwrapDivs
} from './special'
import db from '../db'

beforeEach(async () => {
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

  it('can provide an ordered list', async () => {
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
    const actual = await listChildren('{{Children ordered="true"}}', '/parent', db)
    expect(actual).toEqual('<ol>\n<li><a href="/parent/first-child">First Child</a></li>\n<li><a href="/parent/second-child">Second Child</a></li>\n</ol>')
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

describe('parseTags', () => {
  it('hides tags in wikitext', () => {
    const actual = parseTags('This has [[Knower:2]] some text. [[Location:40.441848, -80.012827]] [[Owner:2]] [[Author:Me]] [[Artist:Someone else]] And some more text after it, too. [[Type:Test]]')
    const expected = 'This has some text. And some more text after it, too.'
    expect(actual).toEqual(expected)
  })
})

describe('parseForm', () => {
  it('creates a form', () => {
    const actual = parseForm('{{Form Name="Test"}}{{/Form}}')
    const expected = '<form action="/save-form" method="post">\n  <input type="hidden" name="form" value="Test" />\n  <button>Send</button>\n</form>'
    expect(actual).toEqual(expected)
  })

  it('handles line breaks', () => {
    const actual = parseForm('{{Form\n  Name="Test"}}\n{{/Form}}')
    const expected = '<form action="/save-form" method="post">\n  <input type="hidden" name="form" value="Test" />\n  <button>Send</button>\n</form>'
    expect(actual).toEqual(expected)
  })

  it('includes text fields', () => {
    const actual = parseForm('{{Form Name="Test"}}{{Field Label="Test"}}{{/Form}}')
    const expected = '<form action="/save-form" method="post">\n  <input type="hidden" name="form" value="Test" />\n  <label for="test-test">Test</label>\n  <input type="text" name="test" id="test-test" />\n  <button>Send</button>\n</form>'
    expect(actual).toEqual(expected)
  })

  it('handles line breaks among fields', () => {
    const actual = parseForm('{{Form Name="Test"}}\n  {{Field\n    Label="Test"}}\n{{/Form}}')
    const expected = '<form action="/save-form" method="post">\n  <input type="hidden" name="form" value="Test" />\n  <label for="test-test">Test</label>\n  <input type="text" name="test" id="test-test" />\n  <button>Send</button>\n</form>'
    expect(actual).toEqual(expected)
  })

  it('handles notes', () => {
    const actual = parseForm('{{Form Name="Test"}}{{Field Label="Test" Note="This is a test."}}{{/Form}}')
    const expected = '<form action="/save-form" method="post">\n  <input type="hidden" name="form" value="Test" />\n  <label for="test-test">\n    Test\n    <p class="note">This is a test.</p>\n  </label>\n  <input type="text" name="test" id="test-test" />\n  <button>Send</button>\n</form>'
    expect(actual).toEqual(expected)
  })

  it('handles email fields', () => {
    const actual = parseForm('{{Form Name="Test"}}{{Field Label="Email" Type="email"}}{{/Form}}')
    const expected = '<form action="/save-form" method="post">\n  <input type="hidden" name="form" value="Test" />\n  <label for="test-email">Email</label>\n  <input type="email" name="email" id="test-email" />\n  <button>Send</button>\n</form>'
    expect(actual).toEqual(expected)
  })

  it('handles textareas', () => {
    const actual = parseForm('{{Form Name="Test"}}{{Field Label="Comment" Type="textarea"}}{{/Form}}')
    const expected = '<form action="/save-form" method="post">\n  <input type="hidden" name="form" value="Test" />\n  <label for="test-comment">Comment</label>\n  <textarea name="comment" id="test-comment"></textarea>\n  <button>Send</button>\n</form>'
    expect(actual).toEqual(expected)
  })

  it('can say something else on the button', () => {
    const actual = parseForm('{{Form Name="Test" Button="Go"}}{{/Form}}')
    const expected = '<form action="/save-form" method="post">\n  <input type="hidden" name="form" value="Test" />\n  <button>Go</button>\n</form>'
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

describe('escapeCodeBlockMarkdown', () => {
  it('escapes Markdown characters inside of code blocks', () => {
    const wikitext = '```Inside block``` Outside block'
    const actual = escapeCodeBlockMarkdown(wikitext)
    const expected = '```&#73;&#110;&#115;&#105;&#100;&#101; &#98;&#108;&#111;&#99;&#107;``` Outside block'
    expect(actual).toEqual(expected)
  })

  it('works over multiple lines', () => {
    const wikitext = '```\r\n    Inside block\r\n```\r\n\r\nOutside block'
    const actual = escapeCodeBlockMarkdown(wikitext)
    const expected = '```\r\n    &#73;&#110;&#115;&#105;&#100;&#101; &#98;&#108;&#111;&#99;&#107;\r\n```\r\n\r\nOutside block'
    expect(actual).toEqual(expected)
  })
})

afterEach(async () => {
  const tables = [ 'changes', 'tags', 'members', 'pages' ]
  for (const table of tables) {
    await db.run(`DELETE FROM ${table};`)
    await db.run(`ALTER TABLE ${table} AUTO_INCREMENT=1;`)
  }
})

afterAll(() => {
  db.end()
})
