/* global describe, it, expect, beforeEach, afterEach, afterAll */

import Member from './member'
import Page from './page'
import db from '../../server/db'

beforeEach(async () => {
  await db.run('INSERT INTO members (name, email, admin) VALUES (\'Admin\', \'admin@thefifthworld.com\', 1);')
  await db.run('INSERT INTO members (name, email) VALUES (\'Normal\', \'normal@thefifthworld.com\');')
})

describe('Page', () => {
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
