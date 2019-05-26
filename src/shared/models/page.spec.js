/* global describe, it, expect, beforeEach, afterEach, afterAll */

import Member from './member'
import Page from './page'
import db from '../../server/db'

beforeEach(async () => {
  const tables = [ 'members', 'pages', 'changes', 'names' ]
  for (const table of tables) {
    await db.run(`DELETE FROM ${table};`)
    await db.run(`ALTER TABLE ${table} AUTO_INCREMENT=1;`)
  }

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

  it('returns an error when a new page uses a reserved path', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    try {
      await Page.create({
        title: 'New Page',
        body: 'This is a new page.',
        path: '/login'
      }, member, 'Initial text', db)
      expect(false).toEqual(true)
    } catch (err) {
      expect(err.toString()).toEqual('Error: /login is a reserved path.')
    }
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

  it('returns an error when you edit a page to use a reserved path', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const page = await Page.create({
      title: 'New Page',
      body: 'This is a new page.'
    }, member, 'Initial text', db)
    try {
      await page.update({
        path: '/login'
      }, member, 'Can we make this /login?', db)
      expect(false).toEqual(true)
    } catch (err) {
      expect(err.toString()).toEqual('Error: /login is a reserved path.')
    }
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

  it('extracts types', () => {
    const type = Page.getType('[[Type:Page]] [[Type:Something Else]]')
    expect(type).toEqual('Page')
  })

  it('tags a page\'s type', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const page = await Page.create({
      title: 'Page 1',
      body: 'This is a page. [[Type:Page]]'
    }, member, 'Initial text', db)
    expect(page.type).toEqual('Page')
  })

  it('overrides a page\'s type on creation', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const page = await Page.create({
      title: 'Page 1',
      body: 'This is a page. [[Type:Page]]',
      type: 'Other'
    }, member, 'Initial text', db)
    expect(page.type).toEqual('Other')
  })

  it('overrides a page\'s type on update', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const page = await Page.create({
      title: 'Page 1',
      body: 'This is a page. [[Type:Page]]'
    }, member, 'Initial text', db)
    page.update({
      type: 'Other'
    }, member, 'Changing type', db)
    expect(page.type).toEqual('Other')
  })

  it('updates a page\'s type', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const page = await Page.create({
      title: 'Page 1',
      body: 'This is a page. [[Type:Page]]'
    }, member, 'Initial text', db)
    page.update({
      body: 'This is a page. [[Type:Other]]'
    }, member, 'Changing type', db)
    expect(page.type).toEqual('Other')
  })

  it('lists a page\'s children', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const parent = await Page.create({
      title: 'Parent',
      body: 'This is a parent page.'
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

    const actual = await parent.getChildren(db)
    const expected = [
      { path: '/parent/child-1', title: 'Child 1', thumbnail: null },
      { path: '/parent/child-2', title: 'Child 2', thumbnail: null }
    ]
    expect(actual).toEqual(expected)
  })

  it('lists a page\'s children of a particular type', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const parent = await Page.create({
      title: 'Parent',
      body: 'This is a parent page.'
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

    const actual = await parent.getChildren(db, 'Match')
    const expected = [
      { path: '/parent/child-2', title: 'Child 2', thumbnail: null }
    ]
    expect(actual).toEqual(expected)
  })

  it('limits a list of a page\'s children', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const parent = await Page.create({
      title: 'Parent',
      body: 'This is a parent page.'
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

    const actual = await parent.getChildren(db, null, 1)
    const expected = [
      { path: '/parent/child-1', title: 'Child 1', thumbnail: null }
    ]
    expect(actual).toEqual(expected)
  })

  it('lists a page\'s children in chronological order', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const parent = await Page.create({
      title: 'Parent',
      body: 'This is a parent page.'
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

    const actual = await parent.getChildren(db, null, null, 'oldest')
    const expected = [
      { path: '/parent/child-1', title: 'Child 1', thumbnail: null },
      { path: '/parent/child-2', title: 'Child 2', thumbnail: null }
    ]
    expect(actual).toEqual(expected)
  })

  it('lists a page\'s children in reverse chronological order', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const parent = await Page.create({
      title: 'Parent',
      body: 'This is a parent page.'
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

    const actual = await parent.getChildren(db, null, null, 'newest')
    const expected = [
      { path: '/parent/child-2', title: 'Child 2', thumbnail: null },
      { path: '/parent/child-1', title: 'Child 1', thumbnail: null }
    ]
    expect(actual).toEqual(expected)
  })

  it('lists a page\'s children in alphabetical order', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const parent = await Page.create({
      title: 'Parent',
      body: 'This is a parent page.'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'Charlie',
      body: 'This is a child page.',
      parent: '/parent'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'Alice',
      body: 'This is a child page.',
      parent: '/parent'
    }, member, 'Initial text', db)
    await Page.create({
      title: 'Bob',
      body: 'This is another child page.',
      parent: '/parent'
    }, member, 'Initial text', db)

    const actual = await parent.getChildren(db, null, null, 'alphabetical')
    const expected = [
      { path: '/parent/alice', title: 'Alice', thumbnail: null },
      { path: '/parent/bob', title: 'Bob', thumbnail: null },
      { path: '/parent/charlie', title: 'Charlie', thumbnail: null }
    ]
    expect(actual).toEqual(expected)
  })

  it('returns an error when a new page uses a reserved template name', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    try {
      await Page.create({
        title: 'Artists',
        body: 'This is a new page. [[Type:Template]]',
        path: '/artists'
      }, member, 'Initial text', db)
      expect(false).toEqual(true)
    } catch (err) {
      expect(err.toString()).toEqual('Error: {{Artists}} is used internally. You cannot create a template with that name.')
    }
  })

  it('returns an error when you edit a page to use a reserved template name', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const page = await Page.create({
      title: 'New Page',
      body: 'This is a new page.'
    }, member, 'Initial text', db)
    try {
      await page.update({
        title: 'Artists',
        body: 'This is a new page. [[Type:Template]]'
      }, member, 'Edit to {{Artists}}', db)
      expect(false).toEqual(true)
    } catch (err) {
      expect(err.toString()).toEqual('Error: {{Artists}} is used internally. You cannot create a template with that name.')
    }
  })

  it('saves coords when it\'s tagged with location', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const page = await Page.create({
      title: 'The Point',
      body: '**The Point** is where the [[Allegheny River]] and the [[Monongahela River]] meet to form the [[Ohio River]]. [[Location:40.441848, -80.012827]]'
    }, member, 'Initial text', db)
    const actual = [ page.lat, page.lon ]
    const expected = [ 40.44185, -80.01283 ]
    expect(actual).toEqual(expected)
  })

  it('marks the page as a place when it\'s tagged with location', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const page = await Page.create({
      title: 'The Point',
      body: '**The Point** is where the [[Allegheny River]] and the [[Monongahela River]] meet to form the [[Ohio River]]. [[Location:40.441848, -80.012827]]'
    }, member, 'Initial text', db)
    expect(page.type).toEqual('Place')
  })

  it('updates coords when it\'s tagged with location', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const page = await Page.create({
      title: 'New Page',
      body: 'This is a new page.'
    }, member, 'Initial text', db)
    try {
      await page.update({
        title: 'The Point',
        body: '**The Point** is where the [[Allegheny River]] and the [[Monongahela River]] meet to form the [[Ohio River]]. [[Location:40.441848, -80.012827]]'
      }, member, 'Make it a place', db)
      const actual = [ page.lat, page.lon ]
      const expected = [ 40.441848, -80.012827 ]
      expect(actual).toEqual(expected)
    } catch (err) {
      console.error(err)
      expect(err).toEqual(null)
    }
  })

  it('updates type to place when it\'s tagged with location', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const page = await Page.create({
      title: 'New Page',
      body: 'This is a new page.'
    }, member, 'Initial text', db)
    try {
      await page.update({
        title: 'The Point',
        body: '**The Point** is where the [[Allegheny River]] and the [[Monongahela River]] meet to form the [[Ohio River]]. [[Location:40.441848, -80.012827]]'
      }, member, 'Make it a place', db)
      expect(page.type).toEqual('Place')
    } catch (err) {
      console.error(err)
      expect(err).toEqual(null)
    }
  })

  it('can extract a claim from the wikitext', () => {
    const claim = Page.getClaim('This is a member\'s page. [[Owner:2]]')
    expect(claim).toEqual(2)
  })

  it('can extract a claim with space (A)', () => {
    const claim = Page.getClaim('This is a member\'s page. [[Owner: 2]]')
    expect(claim).toEqual(2)
  })

  it('can extract a claim with space (B)', () => {
    const claim = Page.getClaim('This is a member\'s page. [[Owner: 2 ]]')
    expect(claim).toEqual(2)
  })

  it('returns null if you try to get a claim when there isn\'t one to get', () => {
    const claim = Page.getClaim('This is a member\'s page.')
    expect(claim).toEqual(null)
  })

  it('returns null if you try to get a claim when it isn\'t a number', () => {
    const claim = Page.getClaim('This is a member\'s page. [[Owner:Someone]]')
    expect(claim).toEqual(null)
  })

  it('extracts the first claim if there are multiple tags', () => {
    const claim = Page.getClaim('This is a member\'s page. [[Owner:2]] [[Owner:3]]')
    expect(claim).toEqual(2)
  })

  it('lets a member claim a page', async () => {
    expect.assertions(1)
    const admin = await Member.get(1, db)
    const page = await Page.create({
      title: 'New Page',
      body: 'This is a member\'s page. [[Owner:2]]'
    }, admin, 'Initial text', db)
    expect(page.claim).toEqual(2)
  })

  it('lets a member update a page to claim it', async () => {
    expect.assertions(1)
    const admin = await Member.get(1, db)
    const page = await Page.create({
      title: 'New Page',
      body: 'This is a member\'s page.'
    }, admin, 'Initial text', db)
    try {
      await page.update({
        title: 'New Page',
        body: 'This is a member\'s page. [[Owner:2]]'
      }, admin, 'Member #2 claims it.', db)
      expect(page.claim).toEqual(2)
    } catch (err) {
      console.error(err)
      expect(err).toEqual(null)
    }
  })

  it('can pick up [[Knower]] tags', () => {
    const actual = Page.getKnowers('Hello! [[Knower:/alice]] [[Knower:/bob]]')
    const expected = [ '/alice', '/bob' ]
    expect(actual).toEqual(expected)
  })

  it('can link names', async () => {
    expect.assertions(1)
    const admin = await Member.get(1, db)
    await Page.create({
      title: 'Alice',
      body: 'This is Alice\'s page. [[Type:Person]]'
    }, admin, 'Initial text', db)
    await Page.create({
      title: 'Bob',
      body: 'This is Bob\'s page. [[Type:Person]]'
    }, admin, 'Initial text', db)
    await Page.create({
      title: 'Abba Zabba',
      body: 'This is a name for Alice. [[Type:Name]] [[Knower:/bob]]',
      parent: '/alice'
    }, admin, 'Initial text', db)
    const res = await db.run(`SELECT * FROM names WHERE name = '/alice/abba-zabba' AND knower = '/bob';`)
    expect(res.length).toEqual(1)
  })

  it('doesn\'t duplicate records on name update', async () => {
    expect.assertions(1)
    const admin = await Member.get(1, db)
    await Page.create({
      title: 'Alice',
      body: 'This is Alice\'s page. [[Type:Person]]'
    }, admin, 'Initial text', db)
    await Page.create({
      title: 'Bob',
      body: 'This is Bob\'s page. [[Type:Person]]'
    }, admin, 'Initial text', db)
    const name = await Page.create({
      title: 'Abba Zabba',
      body: 'This is a name for Alice. [[Type:Name]] [[Knower:/bob]]',
      parent: '/alice'
    }, admin, 'Initial text', db)
    try {
      await name.update({
        title: 'Abba Zabba',
        body: 'This is a name for Alice. We\'re updating it. [[Type:Name]] [[Knower:/bob]]'
      }, admin, 'Small update.', db)
      const res = await db.run(`SELECT * FROM names WHERE name = '/alice/abba-zabba' AND knower = '/bob';`)
      expect(res.length).toEqual(1)
    } catch (err) {
      console.error(err)
      expect(err).toEqual(null)
    }
  })

  it('can add people who know a name', async () => {
    expect.assertions(1)
    const admin = await Member.get(1, db)
    await Page.create({
      title: 'Alice',
      body: 'This is Alice\'s page. [[Type:Person]]'
    }, admin, 'Initial text', db)
    await Page.create({
      title: 'Bob',
      body: 'This is Bob\'s page. [[Type:Person]]'
    }, admin, 'Initial text', db)
    await Page.create({
      title: 'Charlie',
      body: 'This is Charlie\'s page. [[Type:Person]]'
    }, admin, 'Initial text', db)
    const name = await Page.create({
      title: 'Abba Zabba',
      body: 'This is a name for Alice. [[Type:Name]] [[Knower:/bob]]',
      parent: '/alice'
    }, admin, 'Initial text', db)
    try {
      await name.update({
        title: 'Abba Zabba',
        body: 'This is a name for Alice. [[Type:Name]] [[Knower:/bob]] [[Knower:/charlie]]'
      }, admin, 'Small update.', db)
      const res = await db.run(`SELECT * FROM names WHERE name = '/alice/abba-zabba';`)
      expect(res.length).toEqual(2)
    } catch (err) {
      console.error(err)
      expect(err).toEqual(null)
    }
  })

  it('can fetch a more useful object for a name', async () => {
    expect.assertions(1)
    const admin = await Member.get(1, db)
    await Page.create({
      title: 'Alice',
      body: 'This is Alice\'s page. [[Type:Person]]'
    }, admin, 'Initial text', db)
    await Page.create({
      title: 'Bob',
      body: 'This is Bob\'s page. [[Type:Person]]'
    }, admin, 'Initial text', db)
    await Page.create({
      title: 'Abba Zabba',
      body: 'This is a name for Alice. [[Type:Name]] [[Knower:/bob]]',
      parent: '/alice'
    }, admin, 'Initial text', db)
    const actual = await Page.getName('/alice/abba-zabba', db)
    const expected = {
      name: 'Abba Zabba',
      path: '/alice/abba-zabba',
      body: 'This is a name for Alice. [[Type:Name]] [[Knower:/bob]]',
      known: {
        name: 'Alice',
        path: '/alice'
      },
      knowers: [
        {
          name: 'Bob',
          path: '/bob'
        }
      ]
    }
    expect(actual).toEqual(expected)
  })

  it('can fetch a person\'s names', async () => {
    const admin = await Member.get(1, db)
    const a = await Page.create({
      title: 'Alice',
      body: 'This is Alice\'s page. [[Type:Person]]'
    }, admin, 'Initial text', db)
    await Page.create({
      title: 'Bob',
      body: 'This is Bob\'s page. [[Type:Person]]'
    }, admin, 'Initial text', db)
    await Page.create({
      title: 'Abba Zabba',
      body: 'This is a name for Alice. [[Type:Name]] [[Knower:/bob]]',
      parent: '/alice'
    }, admin, 'Initial text', db)
    const actual = await a.getNames(db)
    const expectedName = {
      name: 'Abba Zabba',
      path: '/alice/abba-zabba',
      body: 'This is a name for Alice. [[Type:Name]] [[Knower:/bob]]',
      knowers: [
        {
          name: 'Bob',
          path: '/bob'
        }
      ],
      known: {
        name: 'Alice',
        path: '/alice'
      }
    }
    const expected = [ expectedName ]
    expect(actual).toEqual(expected)
  })

  it('can fetch the names that a person knows', async () => {
    const admin = await Member.get(1, db)
    await Page.create({
      title: 'Alice',
      body: 'This is Alice\'s page. [[Type:Person]]'
    }, admin, 'Initial text', db)
    const b = await Page.create({
      title: 'Bob',
      body: 'This is Bob\'s page. [[Type:Person]]'
    }, admin, 'Initial text', db)
    await Page.create({
      title: 'Abba Zabba',
      body: 'This is a name for Alice. [[Type:Name]] [[Knower:/bob]]',
      parent: '/alice'
    }, admin, 'Initial text', db)
    const actual = await b.getNamesKnown(db)
    const expectedName = {
      name: 'Abba Zabba',
      path: '/alice/abba-zabba',
      body: 'This is a name for Alice. [[Type:Name]] [[Knower:/bob]]',
      knowers: [
        {
          name: 'Bob',
          path: '/bob'
        }
      ],
      known: {
        name: 'Alice',
        path: '/alice'
      }
    }
    const expected = [ expectedName ]
    expect(actual).toEqual(expected)
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
