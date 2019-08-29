/* global describe, it, expect, beforeEach, afterEach, afterAll */

import Member from './member'
import Page from './page'
import db from '../../server/db'

beforeEach(async () => {
  const tables = [ 'members', 'pages', 'changes' ]
  for (const table of tables) {
    await db.run(`DELETE FROM ${table};`)
    await db.run(`ALTER TABLE ${table} AUTO_INCREMENT=1;`)
  }

  await db.run('INSERT INTO members (name, email, admin) VALUES (\'Admin\', \'admin@thefifthworld.com\', 1);')
  await db.run('INSERT INTO members (name, email) VALUES (\'Normal\', \'normal@thefifthworld.com\');')
})

describe('Page', () => {
  it('can pick up [[Knower]] tags', () => {
    const actual = Page.getTag('Hello! [[Knower:/alice]] [[Knower:/bob]]', 'Knower')
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
  const tables = [ 'members', 'pages', 'changes' ]
  for (const table of tables) {
    await db.run(`DELETE FROM ${table};`)
    await db.run(`ALTER TABLE ${table} AUTO_INCREMENT=1;`)
  }
})

afterAll(() => {
  db.end()
})
