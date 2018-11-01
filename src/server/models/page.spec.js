/* global describe, it, expect, beforeEach, afterEach, afterAll */

import Member from './member'
import Page from './page'
import db from '../db'

beforeEach(async () => {
  await db.run('ALTER TABLE members AUTO_INCREMENT=1;')
  await db.run('ALTER TABLE pages AUTO_INCREMENT=1;')
  await db.run('ALTER TABLE changes AUTO_INCREMENT=1;')
  await db.run('INSERT INTO members (name, email, admin) VALUES (\'Admin\', \'admin@thefifthworld.com\', 1);')
  await db.run('INSERT INTO members (name, email) VALUES (\'Normal\', \'normal@thefifthworld.com\');')
})

describe('Page', () => {
  it('can create a page', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const page = await Page.create({
      title: 'New Page',
      body: 'This is a new page.'
    }, member, 'Initial text', db)

    const checks = []
    checks.push(page.title === 'New Page')
    checks.push(page.slug === 'new-page')
    checks.push(page.path === '/new-page')
    checks.push(page.parent === 0)
    checks.push(page.type === 'wiki')
    checks.push(page.changes[0].timestamp > Date.now() - 60000)
    checks.push(page.changes[0].msg === 'Initial text')
    checks.push(page.changes[0].content.title === 'New Page')
    checks.push(page.changes[0].content.body === 'This is a new page.')
    checks.push(page.changes[0].editor.name === 'Normal')
    checks.push(page.changes[0].editor.id === 2)
    expect(checks.reduce((res, check) => res && check)).toEqual(true)
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

  it('can create child pages', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const parent = await Page.create({
      title: 'Parent Page',
      body: 'This is the parent page.'
    }, member, 'Initial text', db)

    const child = await Page.create({
      parent,
      title: 'Child Page',
      body: 'This is the parent page.'
    }, member, 'Initial text', db)

    const grandchild = await Page.create({
      parent: child,
      title: 'Grandchild Page',
      body: 'This is the parent page.'
    }, member, 'Initial text', db)

    const actual = [ parent.path, child.path, grandchild.path ]
    const expected = [
      '/parent-page',
      '/parent-page/child-page',
      '/parent-page/child-page/grandchild-page'
    ]
    expect(actual).toEqual(expected)
  })

  it('can update a page', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const page = await Page.create({
      title: 'New Page',
      body: 'This is a new page.'
    }, member, 'Initial text', db)

    await page.update({
      title: 'New Page',
      body: 'New content'
    }, member, 'Testing update', db)
    expect(page.changes[0].content.body).toEqual('New content')
  })

  it('can return its current data', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const page = await Page.create({
      title: 'New Page',
      body: 'This is a new page.'
    }, member, 'Initial text', db)

    const update = {
      title: 'New Page Title',
      path: '/updated',
      body: 'New content'
    }
    await page.update(update, member, 'Testing update', db)

    const updated = await Page.get('/updated', db)
    const content = updated.getContent()
    const actual = { title: updated.title, path: updated.path, body: content.body }
    expect(actual).toEqual(update)
  })

  it('can fetch a page by path', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    await Page.create({
      title: 'New Page',
      body: 'This is a new page.'
    }, member, 'Initial text', db)

    const page = await Page.get('/new-page', db)
    const content = page.getContent()
    expect(content.body).toEqual('This is a new page.')
  })

  it('can figure out if it has a page or just an ID', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const page = await Page.create({
      title: 'New Page',
      body: 'This is a new page.'
    }, member, 'Initial text', db)

    const fetched = await Page.get(page, db)
    expect(page).toEqual(fetched)
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
