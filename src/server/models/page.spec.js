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
    const data = {
      title: 'New Page',
      body: 'This is a new page.'
    }
    const msg = 'Initial text'
    const page = await Page.create(data, member, msg, db)

    const checks = []
    checks.push(page.path === '/new-page')
    checks.push(page.parent === 0)
    checks.push(page.type === 'wiki')
    checks.push(page.changes[0].timestamp > Date.now() - 60000)
    checks.push(page.changes[0].msg === 'Initial text')
    checks.push(page.changes[0].content.title === data.title)
    checks.push(page.changes[0].content.body === data.body)
    checks.push(page.changes[0].editor.name === 'Normal')
    checks.push(page.changes[0].editor.id === 2)
    expect(checks.reduce((res, check) => res && check)).toEqual(true)
  })

  it('can update a page', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const data = {
      title: 'New Page',
      body: 'This is a new page.'
    }
    let msg = 'Initial text'
    const page = await Page.create(data, member, msg, db)

    const update = {
      title: 'New Page',
      body: 'New content'
    }
    msg = 'Testing update'
    await page.update(update, member, msg, db)
    expect(page.changes[0].content.body).toEqual(update.body)
  })

  it('can return its current data', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const data = {
      title: 'New Page',
      body: 'This is a new page.'
    }
    let msg = 'Initial text'
    const page = await Page.create(data, member, msg, db)

    const update = {
      title: 'New Page Title',
      body: 'New content'
    }
    msg = 'Testing update'
    await page.update(update, member, msg, db)
    const content = page.getContent()
    const actual = { title: page.title, body: content.body }
    expect(actual).toEqual(update)
  })

  it('can fetch a page by path', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const data = {
      title: 'New Page',
      body: 'This is a new page.'
    }
    const msg = 'Initial text'
    await Page.create(data, member, msg, db)

    const page = await Page.get('/new-page', db)
    const content = page.getContent()
    expect(content.body).toEqual(data.body)
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
