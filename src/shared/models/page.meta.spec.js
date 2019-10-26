/* global describe, it, expect, beforeEach, afterEach, afterAll */

import Member from './member'
import Page from './page'
import db from '../../server/db'

beforeEach(async () => {
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

  it('can create a page with a header', async () => {
    expect.assertions(1)
    const header = 'https://example.com/image.png'
    const member = await Member.get(2, db)
    const page = await Page.create({
      title: 'New Page',
      body: 'This is a new page.',
      header
    }, member, 'Initial text', db)
    expect(page.header).toEqual(header)
  })

  it('can update a page\'s header', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const page = await Page.create({
      title: 'New Page',
      body: 'This is a new page.',
      header: 'https://example.com/old.png'
    }, member, 'Initial text', db)

    const header = 'https://example.com/new.png'
    await page.update({
      title: 'New Page',
      body: 'New content',
      header
    }, member, 'Testing image update', db)
    expect(page.header).toEqual(header)
  })

  it('can update a page\'s header to null', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const page = await Page.create({
      title: 'New Page',
      body: 'This is a new page.',
      header: 'https://example.com/old.png'
    }, member, 'Initial text', db)

    await page.update({
      title: 'New Page',
      body: 'New content',
      header: ''
    }, member, 'Testing image update', db)
    expect(page.header).toEqual(null)
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

  it('will create a description from the body if no other is provided', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const page = await Page.create({
      title: 'New Page',
      body: 'The world has changed. The ruins of ancient cities lie submerged beneath the swollen seas. Beaches of translucent plastic sand mark new boundaries between land and water. Jungles stretch from the equator to the poles. Herds of elephants trample savannas in Canada and Russia.'
    }, member, 'Initial text', db)
    expect(page.description).toEqual('The world has changed. The ruins of ancient cities lie submerged beneath the swollen seas.')
  })

  it('will create a description from the body if no other is provided, and can handle a long first sentence', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const page = await Page.create({
      title: 'New Page',
      body: 'The default cut-off is at one hundred fifty characters, but this paragraph\'s first sentence is longer than that, which is a scenario that we\'re going to encounter in some instances. This test helps ensure that we can handle those cases.'
    }, member, 'Initial text', db)
    expect(page.description).toEqual('The default cut-off is at one hundred fifty characters, but this paragraph’s first sentence is longer than that, which is a scenario that we’re going…')
  })

  it('does not count Markdown', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    const page = await Page.create({
      title: 'New Page',
      body: 'For this test, we need sentences very close to the limit. **We have Markdown**, and if you count those characters, then this sentence won\'t make the cut. But if you don\'t count the Markdown, it will.'
    }, member, 'Initial text', db)
    expect(page.description).toEqual('For this test, we need sentences very close to the limit. We have Markdown, and if you count those characters, then this sentence won’t make the cut.')
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
