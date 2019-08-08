/* global describe, it, expect, beforeEach, afterEach, afterAll */

import Member from '../../shared/models/member'
import Page from '../../shared/models/page'
import templateParse from './template'
import db from '../db'

beforeEach(async () => {
  const tables = [ 'members', 'pages', 'changes' ]
  for (const table of tables) {
    await db.run(`DELETE FROM ${table};`)
    await db.run(`ALTER TABLE ${table} AUTO_INCREMENT=1;`)
  }

  await db.run('INSERT INTO members (name, email, admin) VALUES (\'Admin\', \'admin@thefifthworld.com\', 1);')
  await db.run('INSERT INTO members (name, email) VALUES (\'Normal\', \'normal@thefifthworld.com\');')
})

describe('templateParse', () => {
  it('adds a template', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    await Page.create({
      title: 'Template:Hello',
      body: '{{Template}}Hello world!{{/Template}} [[Type:Template]]'
    }, member, 'Initial text', db)
    const actual = await templateParse('{{Template:Hello}}', db)
    expect(actual).toEqual('Hello world!')
  })

  it('can take a parameter', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    await Page.create({
      title: 'Template:Hello',
      body: '{{Template}}Hello, {{{Name}}}!{{/Template}} [[Type:Template]]'
    }, member, 'Initial text', db)
    const actual = await templateParse('{{Template:Hello Name="Bob"}}', db)
    expect(actual).toEqual('Hello, Bob!')
  })

  it('works with curly quotes', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    await Page.create({
      title: 'Template:Hello',
      body: '{{Template}}Hello, {{{Name}}}!{{/Template}} [[Type:Template]]'
    }, member, 'Initial text', db)
    const actual = await templateParse('{{Template:Hello Name=”Bob”}}', db)
    expect(actual).toEqual('Hello, Bob!')
  })

  it('works with line breaks between parameters', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    await Page.create({
      title: 'Template:Hello',
      body: '{{Template}}Hello, {{{Name}}}!{{/Template}} [[Type:Template]]'
    }, member, 'Initial text', db)
    const actual = await templateParse('{{Template:Hello\n  Name=”Bob”}}', db)
    expect(actual).toEqual('Hello, Bob!')
  })

  it('can provide documentation', async () => {
    expect.assertions(1)
    const member = await Member.get(2, db)
    await Page.create({
      title: 'Template:Hello',
      body: '{{Template}}Hello, {{{Name}}}!{{/Template}} This template greets you.\n\n## Example\n\n{{Temmplate:Hello Name="Bob"}}\n\n##Markdown\n\n```\n{{Temmplate:Hello Name="Bob"}}\n```\n\n[[Type:Template]]'
    }, member, 'Initial text', db)
    const actual = await templateParse('{{Template:Hello Name=”Bob”}}', db)
    expect(actual).toEqual('Hello, Bob!')
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
