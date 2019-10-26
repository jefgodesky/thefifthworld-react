/* global describe, it, expect, beforeEach, afterEach, afterAll */

import Member from './member'
import Page from './page'
import db from '../../server/db'

beforeEach(async () => {
  await db.run('INSERT INTO members (name, email, admin) VALUES (\'Admin\', \'admin@thefifthworld.com\', 1);')
  await db.run('INSERT INTO members (name, email) VALUES (\'Normal\', \'normal@thefifthworld.com\');')
})

describe('Page', () => {
  it('saves coords when it\'s tagged with location', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const page = await Page.create({
      title: 'The Point',
      body: '**The Point** is where the [[Allegheny River]] and the [[Monongahela River]] meet to form the [[Ohio River]]. [[Location:40.441848, -80.012827]]'
    }, member, 'Initial text', db)
    const actual = [ page.lat, page.lon ]
    const expected = [ 40.441848, -80.012827 ]
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
})

afterEach(async () => {
  const tables = [ 'changes', 'places', 'tags', 'members', 'pages' ]
  for (const table of tables) {
    await db.run(`DELETE FROM ${table};`)
    await db.run(`ALTER TABLE ${table} AUTO_INCREMENT=1;`)
  }
})

afterAll(() => {
  db.end()
})
