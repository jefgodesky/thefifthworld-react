/* global describe, it, expect, beforeEach, afterEach, afterAll */

import Member from './member'
import Page from './page'
import db from '../db'
import es from '../../shared/es'

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
    }, member, 'Initial text', db, es)

    const indexed = await es.exists({
      index: 'wiki_test',
      type: '_doc',
      id: page.id
    })

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
    checks.push(indexed)
    expect(checks.reduce((res, check) => res && check)).toEqual(true)
  })

  it('can figure out a path', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const parent = await Page.create({
      title: 'Parent Page',
      body: 'This is the parent page.'
    }, member, 'Initial text', db, es)

    const actual = []
    actual.push(await Page.getPath({ title: 'Child Page' }, 0, db))
    actual.push(await Page.getPath({ title: 'Child Page' }, parent, db))
    actual.push(await Page.getPath({ title: 'Child Page' }, parent.id, db))

    const child = await Page.create({
      parent,
      title: 'Child Page',
      body: 'This is the child page.'
    }, member, 'Initial text', db, es)
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
    }, member, 'Initial text', db, es)

    const child = await Page.create({
      parent,
      title: 'Child Page',
      body: 'This is the parent page.'
    }, member, 'Initial text', db, es)

    const grandchild = await Page.create({
      parent: child,
      title: 'Grandchild Page',
      body: 'This is the parent page.'
    }, member, 'Initial text', db, es)

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
    }, member, 'Initial text', db, es)

    await page.update({
      title: 'New Page',
      body: 'New content'
    }, member, 'Testing update', db, es)

    const indexed = await es.get({
      index: 'wiki_test',
      type: '_doc',
      id: page.id
    })

    const actual = `${page.changes[0].content.body} (${indexed._source.body})`
    const expected = 'New content (New content)'
    expect(actual).toEqual(expected)
  })

  it('can update a page to a new parent', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const actual = []
    const origParent = await Page.create({
      title: 'Original Parent Page',
      body: 'This is the original parent page.'
    }, member, 'Initial text', db, es)

    const newParent = await Page.create({
      title: 'New Parent Page',
      body: 'This is the new parent page.'
    }, member, 'Initial text', db, es)

    const child = await Page.create({
      parent: origParent,
      title: 'Child Page',
      body: 'This is the child page.'
    }, member, 'Initial text', db, es)
    actual.push(child.parent)

    await child.update({
      parent: newParent,
      title: 'Child Page',
      body: 'This is the child page.'
    }, member, 'Change parent', db, es)
    actual.push(child.parent)

    const expected = [ origParent.id, newParent.id ]
    expect(actual).toEqual(expected)
  })

  it('can return its current data', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const page = await Page.create({
      title: 'New Page',
      body: 'This is a new page.'
    }, member, 'Initial text', db, es)

    const update = {
      title: 'New Page Title',
      path: '/updated',
      body: 'New content'
    }
    await page.update(update, member, 'Testing update', db, es)

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
    }, member, 'Initial text', db, es)

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
    }, member, 'Initial text', db, es)

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
    const page = await Page.create(orig, member, 'Initial text', db, es)

    await page.update({
      title: 'New Page Title',
      path: '/updated',
      body: 'Not such a great update'
    }, member, 'Testing update', db, es)

    if (page.changes && page.changes.length === 2) {
      await page.rollbackTo(page.changes[1].id, member, db, es)
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
    }, admin, 'Initial text', db, es)

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
    }, member, 'Initial text', db, es)

    page.update({
      type: 'group',
      title: 'New Group',
      body: 'This is a new group.',
      permissions: 440
    }, admin, 'Locking page', db, es)

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
    }, member, 'Initial text', db, es)

    page.update({
      type: 'group',
      title: 'New Group',
      body: 'This is a new group.',
      owner: 1
    }, admin, 'Changing owner', db, es)

    expect(page.owner).toEqual(1)
  })
})

afterEach(async () => {
  const tables = [ 'members', 'pages', 'changes' ]
  for (const table of tables) {
    await db.run(`DELETE FROM ${table};`)
    await db.run(`ALTER TABLE ${table} AUTO_INCREMENT=1;`)
  }

  const types = Page.getTypes()
  const index = types.map(type => `${type}_test`)
  await es.indices.delete({
    index,
    ignoreUnavailable: true
  })
})

afterAll(() => {
  db.end()
})
