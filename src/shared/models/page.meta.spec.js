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
  it('can create a page with an image', async () => {
    expect.assertions(1)
    const image = 'https://example.com/image.png'
    const member = await Member.get(2, db)
    const page = await Page.create({
      title: 'New Page',
      body: 'This is a new page.',
      image
    }, member, 'Initial text', db)
    expect(page.image).toEqual(image)
  })

  it('can update a page\'s image', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const page = await Page.create({
      title: 'New Page',
      body: 'This is a new page.',
      image: 'https://example.com/old.png'
    }, member, 'Initial text', db)

    const image = 'https://example.com/new.png'
    await page.update({
      title: 'New Page',
      body: 'New content',
      image
    }, member, 'Testing image update', db)
    expect(page.image).toEqual(image)
  })

  it('can create a page with a description', async () => {
    expect.assertions(1)
    const description = 'This is a description.'
    const member = await Member.get(2, db)
    const page = await Page.create({
      title: 'New Page',
      body: 'This is a new page.',
      description
    }, member, 'Initial text', db)
    expect(page.description).toEqual(description)
  })

  it('can update a page\'s description', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const page = await Page.create({
      title: 'New Page',
      body: 'This is a new page.',
      description: 'This is the old description.'
    }, member, 'Initial text', db)

    const description = 'This is the new description.'
    await page.update({
      title: 'New Page',
      body: 'New content',
      description
    }, member, 'Testing description update', db)
    expect(page.description).toEqual(description)
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
