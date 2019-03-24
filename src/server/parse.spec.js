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
    expect(actual.trim()).toEqual(expected.trim())
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
    expect(actual.trim()).toEqual(expected.trim())
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
    expect(actual.trim()).toEqual(expected.trim())
  })

  it('supports templates', async () => {
    expect.assertions(1)

    const member = await Member.get(1, db)
    await Page.create({
      title: 'Test Template',
      body: '{{Template}}This is a template.{{/Template}} [[Type:Template]]'
    }, member, 'Initial text', db)

    const actual = await parse('{{Test Template}} This is a page.', db)
    const expected = '<p>This is a template. This is a page.</p>'
    expect(actual.trim()).toEqual(expected.trim())
  })

  it('supports templates with parameters', async () => {
    expect.assertions(1)

    const member = await Member.get(1, db)
    await Page.create({
      title: 'Template',
      body: '{{Template}}This is a template. {{{p1}}} {{{p2}}}{{/Template}} [[Type:Template]]'
    }, member, 'Initial text', db)

    const actual = await parse('{{Template\n  p1="This is a parameter."\n  p2="This is also a parameter."\n}}\n\nThis is a page.', db)
    const expected = '<p>This is a template. This is a parameter. This is also a parameter.</p>\n<p>This is a page.</p>'
    expect(actual.trim()).toEqual(expected.trim())
  })

  it('doesn\'t render templates on their own pages', async () => {
    expect.assertions(1)
    const actual = await parse('{{Template}}This is a template.{{/Template}} This is documentation. [[Type:Template]]', db)
    const expected = '<p>This is documentation.</p>'
    expect(actual.trim()).toEqual(expected.trim())
  })

  it('lists children', async () => {
    expect.assertions(1)

    const member = await Member.get(1, db)
    const parent = await Page.create({
      title: 'Parent',
      body: 'This is a parent page.\n\n{{Children}}'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'Child 1',
      body: 'This is a child page.',
      parent: '/parent'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'Child 2',
      body: 'This is another child page.',
      parent: '/parent'
    }, member, 'Initial text', db)

    const content = parent.getContent()
    const actual = content ? await parse(content.body, db, '/parent') : false
    const expected = '<p>This is a parent page.</p>\n<ul>\n<li><a href="/parent/child-1">Child 1</a></li>\n<li><a href="/parent/child-2">Child 2</a></li>\n</ul>'
    expect(actual.trim()).toEqual(expected.trim())
  })

  it('lists children of a different page', async () => {
    expect.assertions(1)

    const member = await Member.get(1, db)
    await Page.create({
      title: 'Parent',
      body: 'This is a parent page.'
    }, member, 'Initial text', db)
    const page = await Page.create({
      title: 'Child 1',
      body: 'This is a child page. {{Children of="/parent"}}',
      parent: '/parent'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'Child 2',
      body: 'This is another child page.',
      parent: '/parent'
    }, member, 'Initial text', db)

    const content = page.getContent()
    const actual = content ? await parse(content.body, db, '/parent/child-1') : false
    const expected = '<p>This is a child page. </p>\n<ul>\n<li><a href="/parent/child-1">Child 1</a></li>\n<li><a href="/parent/child-2">Child 2</a></li>\n</ul>'
    expect(actual.trim()).toEqual(expected.trim())
  })

  it('lists children of a specific type', async () => {
    expect.assertions(1)

    const member = await Member.get(1, db)
    const page = await Page.create({
      title: 'Parent',
      body: 'This is a parent page.\n\n{{Children type="Match"}}'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'Child 1',
      body: 'This is a child page. [[Type:Not a match]]',
      parent: '/parent'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'Child 2',
      body: 'This is another child page. [[Type:Match]]',
      parent: '/parent'
    }, member, 'Initial text', db)

    const content = page.getContent()
    const actual = content ? await parse(content.body, db, '/parent') : false
    const expected = '<p>This is a parent page.</p>\n<ul>\n<li><a href="/parent/child-2">Child 2</a></li>\n</ul>'
    expect(actual.trim()).toEqual(expected.trim())
  })

  it('limits list of children', async () => {
    expect.assertions(1)

    const member = await Member.get(1, db)
    const page = await Page.create({
      title: 'Parent',
      body: 'This is a parent page.\n\n{{Children limit="1"}}'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'Child 1',
      body: 'This is a child page.',
      parent: '/parent'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'Child 2',
      body: 'This is another child page.',
      parent: '/parent'
    }, member, 'Initial text', db)

    const content = page.getContent()
    const actual = content ? await parse(content.body, db, '/parent') : false
    const expected = '<p>This is a parent page.</p>\n<ul>\n<li><a href="/parent/child-1">Child 1</a></li>\n</ul>'
    expect(actual.trim()).toEqual(expected.trim())
  })

  it('sanitizes HTML', async () => {
    expect.assertions(1)
    const actual = await parse('<script></script><div id="my-div"></div><span style="color: red;"></span>')
    const expected = '<p><div id="my-div"></div><span style="color: red;"></span></p>'
    expect(actual.trim()).toEqual(expected.trim())
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
