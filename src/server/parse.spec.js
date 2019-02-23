/* global describe, it, expect, beforeEach, afterEach, afterAll */

import Member from '../shared/models/member'
import Page from '../shared/models/page'
import parse from './parse'
import db from './db'

beforeEach(async () => {
  await db.run('ALTER TABLE members AUTO_INCREMENT=1;')
  await db.run('ALTER TABLE pages AUTO_INCREMENT=1;')
  await db.run('ALTER TABLE changes AUTO_INCREMENT=1;')
  await db.run('INSERT INTO members (name, email, admin) VALUES (\'Admin\', \'admin@thefifthworld.com\', 1);')
  await db.run('INSERT INTO members (name, email) VALUES (\'Normal\', \'normal@thefifthworld.com\');')
})

describe('Wikitext parser', () => {
  it('handles bolding with single quotes', async () => {
    expect.assertions(1)
    const wikitext = `'''This''' has a few '''bolded''' words.`
    const actual = await parse(wikitext, db)
    const expected = '<p><strong>This</strong> has a few <strong>bolded</strong> words.</p>'
    expect(actual).toEqual(expected)
  })

  it('handles bolding with asterisks', async () => {
    expect.assertions(1)
    const wikitext = `**This** has a few **bolded** words.`
    const actual = await parse(wikitext, db)
    const expected = '<p><strong>This</strong> has a few <strong>bolded</strong> words.</p>'
    expect(actual).toEqual(expected)
  })

  it('handles italics with single quotes', async () => {
    expect.assertions(1)
    const wikitext = `''This'' has a few ''italicized'' words.`
    const actual = await parse(wikitext, db)
    const expected = '<p><em>This</em> has a few <em>italicized</em> words.</p>'
    expect(actual).toEqual(expected)
  })

  it('handles italics with asterisks', async () => {
    expect.assertions(1)
    const wikitext = `*This* has a few *italicized* words.`
    const actual = await parse(wikitext, db)
    const expected = '<p><em>This</em> has a few <em>italicized</em> words.</p>'
    expect(actual).toEqual(expected)
  })

  it('handles bolding and italics with single quotes', async () => {
    expect.assertions(1)
    const wikitext = `''This'' has a few ''words'' that are both '''bolded''' '''''and''''' ''italicized''.`
    const actual = await parse(wikitext, db)
    const expected = '<p><em>This</em> has a few <em>words</em> that are both <strong>bolded</strong> <strong><em>and</em></strong> <em>italicized</em>.</p>'
    expect(actual).toEqual(expected)
  })

  it('handles bolding and italics with asterisks', async () => {
    expect.assertions(1)
    const wikitext = `*This* has a few *words* that are both **bolded** ***and*** *italicized*.`
    const actual = await parse(wikitext, db)
    const expected = '<p><em>This</em> has a few <em>words</em> that are both <strong>bolded</strong> <strong><em>and</em></strong> <em>italicized</em>.</p>'
    expect(actual).toEqual(expected)
  })

  it('handles external links', async () => {
    expect.assertions(1)
    const wikitext = `This contains a [https://thefifthworld.com link].`
    const actual = await parse(wikitext, db)
    const expected = '<p>This contains a <a href="https://thefifthworld.com">link</a>.</p>'
    expect(actual).toEqual(expected)
  })

  it('handles paragraph breaks', async () => {
    expect.assertions(1)
    const wikitext = `This is a paragraph.
    
This is a second paragraph.`
    const actual = await parse(wikitext, db)
    const expected = `<p>This is a paragraph.</p>
<p>This is a second paragraph.</p>`
    expect(actual).toEqual(expected)
  })

  it('handles internal links', async () => {
    expect.assertions(1)

    const member = await Member.get(1, db)
    await Page.create({
      title: 'Page 1',
      body: 'This is a page.'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'Page 2',
      body: 'This is a page.'
    }, member, 'Initial text', db)

    const actual = await parse('This includes links to [[Page 1]], [[Page 2|a second page]], and [[Page 3|one that does not exist yet]].', db)
    const expected = '<p>This includes links to <a href="/page-1">Page 1</a>, <a href="/page-2">a second page</a>, and <a href="/page-3?create" class="new">one that does not exist yet</a>.</p>'
    expect(actual).toEqual(expected)
  })

  it('handles paths', async () => {
    expect.assertions(1)

    const member = await Member.get(1, db)
    await Page.create({
      title: 'Page 1',
      body: 'This is a page.'
    }, member, 'Initial text', db)

    const actual = await parse('[[/page-1 Page]]', db)
    const expected = '<p><a href="/page-1">Page</a></p>'
    expect(actual).toEqual(expected)
  })

  it('links to the lowest-level matching page', async () => {
    expect.assertions(1)

    const member = await Member.get(1, db)
    await Page.create({
      title: 'Page',
      body: 'This is a page.'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'Parent',
      body: 'This is a parent page.'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'Page',
      body: 'This is also a page.',
      parent: '/parent'
    }, member, 'Initial text', db)

    const actual = await parse('[[Page]]', db)
    const expected = '<p><a href="/page">Page</a></p>'
    expect(actual).toEqual(expected)
  })

  it('supports templates', async () => {
    expect.assertions(1)

    const member = await Member.get(1, db)
    await Page.create({
      title: 'Template',
      body: '<tpl>This is a template.</tpl> [[Type:Template]]'
    }, member, 'Initial text', db)

    const actual = await parse('{{Template}} This is a page.', db)
    const expected = '<p>This is a template. This is a page.</p>'
    expect(actual).toEqual(expected)
  })

  it('doesn\'t render templates on their own pages', async () => {
    expect.assertions(1)
    const actual = await parse('<tpl>This is a template.</tpl> This is documentation. [[Type:Template]]', db)
    const expected = '<p>This is documentation.</p>'
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
