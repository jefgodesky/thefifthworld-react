/* global describe, it, expect, beforeEach, afterEach, afterAll */

import Member from './member'
import Page from './page'
import db from '../../server/db'

beforeEach(async () => {
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
    checks.push(page.changes[0].timestamp > Date.now() - 60000)
    checks.push(page.changes[0].msg === 'Initial text')
    checks.push(page.changes[0].content.title === 'New Page')
    checks.push(page.changes[0].content.body === 'This is a new page.')
    checks.push(page.changes[0].editor.name === 'Normal')
    checks.push(page.changes[0].editor.id === 2)
    expect(checks.reduce((res, check) => res && check)).toEqual(true)
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

    const actual = page.changes[0].content.body
    const expected = 'New content'
    expect(actual).toEqual(expected)
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
    const content = page.getContent()
    expect(content).toEqual(update)
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

  it('can roll back changes', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const orig = {
      title: 'New Page',
      body: 'This is a new page.'
    }
    const page = await Page.create(orig, member, 'Initial text', db)

    await page.update({
      title: 'New Page Title',
      path: '/updated',
      body: 'Not such a great update'
    }, member, 'Testing update', db)

    if (page.changes && page.changes.length === 2) {
      await page.rollbackTo(page.changes[1].id, member, db)
      expect(page.getContent()).toEqual(orig)
    } else {
      expect('Number of changes').toEqual(2)
    }
  })

  it('can be created with permissions', async () => {
    expect.assertions(1)
    const admin = await Member.get(1, db)
    const member = await Member.get(2, db)
    const page = await Page.create({
      type: 'group',
      title: 'New Group',
      body: 'This is a new group.',
      permissions: 740
    }, admin, 'Initial text', db)

    const actual = [ page.canRead(member), page.canWrite(member), page.canRead(), page.canWrite() ]
    const expected = [ true, false, false, false ]
    expect(actual).toEqual(expected)
  })

  it('can update permissions', async () => {
    expect.assertions(1)
    const admin = await Member.get(1, db)
    const member = await Member.get(2, db)
    const page = await Page.create({
      type: 'group',
      title: 'New Group',
      body: 'This is a new group.',
      permissions: 740
    }, member, 'Initial text', db)

    await page.update({
      type: 'group',
      title: 'New Group',
      body: 'This is a new group.',
      permissions: 440
    }, admin, 'Locking page', db)

    const actual = [
      page.canRead(admin), page.canWrite(admin),
      page.canRead(member), page.canWrite(member),
      page.canRead(), page.canWrite(),
      page.owner
    ]

    const expected = [ true, true, true, false, false, false, 2 ]
    expect(actual).toEqual(expected)
  })

  it('can update the owner', async () => {
    expect.assertions(1)
    const admin = await Member.get(1, db)
    const member = await Member.get(2, db)
    const page = await Page.create({
      type: 'group',
      title: 'New Group',
      body: 'This is a new group.'
    }, member, 'Initial text', db)

    await page.update({
      type: 'group',
      title: 'New Group',
      body: 'This is a new group.',
      owner: 1
    }, admin, 'Changing owner', db)

    expect(page.owner).toEqual(1)
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
