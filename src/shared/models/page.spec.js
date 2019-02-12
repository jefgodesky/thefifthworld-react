/* global describe, it, expect, beforeEach, afterEach, afterAll */

import Member from './member'
import Page from './page'
import db from '../../server/db'

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
    checks.push(page.changes[0].timestamp > Date.now() - 60000)
    checks.push(page.changes[0].msg === 'Initial text')
    checks.push(page.changes[0].content.title === 'New Page')
    checks.push(page.changes[0].content.body === 'This is a new page.')
    checks.push(page.changes[0].editor.name === 'Normal')
    checks.push(page.changes[0].editor.id === 2)
    expect(checks.reduce((res, check) => res && check)).toEqual(true)
  })

  it('returns an error when a new page uses an existing path', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    await Page.create({
      title: 'New Page',
      body: 'This is a new page.',
      path: '/new-page'
    }, member, 'Initial text', db)
    try {
      await Page.create({
        title: 'New Page',
        body: 'This is a new page.',
        path: '/new-page'
      }, member, 'Initial text', db)
      expect(false).toEqual(true)
    } catch (err) {
      expect(err.code).toEqual('ER_DUP_ENTRY')
    }
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

    const actual = page.changes[0].content.body
    const expected = 'New content'
    expect(actual).toEqual(expected)
  })

  it('can update a page to a new parent', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const actual = []
    const origParent = await Page.create({
      title: 'Original Parent Page',
      body: 'This is the original parent page.'
    }, member, 'Initial text', db)

    const newParent = await Page.create({
      title: 'New Parent Page',
      body: 'This is the new parent page.'
    }, member, 'Initial text', db)

    const child = await Page.create({
      parent: origParent,
      title: 'Child Page',
      body: 'This is the child page.'
    }, member, 'Initial text', db)
    actual.push(child.parent)

    await child.update({
      parent: newParent,
      title: 'Child Page',
      body: 'This is the child page.'
    }, member, 'Change parent', db)
    actual.push(child.parent)

    const expected = [ origParent.id, newParent.id ]
    expect(actual).toEqual(expected)
  })

  it('updates depth when it updates parent', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    await Page.create({
      title: 'Parent 1',
      body: 'This is a parent page.'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'Parent 2',
      body: 'This is a parent page.'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'Child',
      body: 'This is a child page.',
      parent: '/parent-2'
    }, member, 'Initial text', db)
    const page = await Page.create({
      title: 'Test Page',
      body: 'This is the page that we will move.',
      parent: '/parent-2/child'
    }, member, 'Initial text', db)

    const before = [ page.depth, page.path ]

    await page.update({
      parent: '/parent-1',
      path: '/parent-1/test-page'
    }, member, 'Change parent', db)

    const actual = [ ...before, page.depth, page.path ]
    expect(actual).toEqual([ 2, '/parent-2/child/test-page', 1, '/parent-1/test-page' ])
  })

  it('updates the slug if you update the path', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const page = await Page.create({
      title: 'Page',
      body: 'This is a test page.'
    }, member, 'Initial text', db)

    await page.update({
      path: '/something/something/new-path'
    }, member, 'Changing path', db)

    expect([ page.path, page.slug ]).toEqual([ '/something/something/new-path', 'new-path' ])
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

  it('can return a page lineage', async () => {
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
      body: 'This is the grandchild page.'
    }, member, 'Initial text', db)

    const lineage = await grandchild.getLineage(db)
    const actual = lineage.map(page => page.title)
    const expected = [ 'Child Page', 'Parent Page' ]
    expect(actual).toEqual(expected)
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

    page.update({
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

    page.update({
      type: 'group',
      title: 'New Group',
      body: 'This is a new group.',
      owner: 1
    }, admin, 'Changing owner', db)

    expect(page.owner).toEqual(1)
  })

  it('can autocomplete a title', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    await Page.create({
      title: 'Page',
      body: 'This is a page.'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'Paganism',
      body: 'This is paganism!'
    }, member, 'Initial text', db)

    const type1 = await Page.autocomplete('pag', db)
    const type2 = await Page.autocomplete('page', db)
    const actual = [ type1.length, type2.length ]
    const expected = [ 2, 1 ]
    expect(actual).toEqual(expected)
  })

  it('can return paths for a list of titles', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    await Page.create({
      title: 'Page 1',
      body: 'This is a page.'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'Page 2',
      body: 'This is a page.'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'Page 3',
      path: '/cool-new-path',
      body: 'This is a page.'
    }, member, 'Initial text', db)

    const paths = await Page.getPaths([ 'Page 1', 'Page 2', '/cool-new-path' ], db)
    const actual = paths.map(res => res.path)
    const expected = [ '/page-1', '/page-2', '/cool-new-path' ]
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
