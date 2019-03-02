/* global describe, it, expect, beforeEach, afterEach, afterAll */

import axios from 'axios'
import File from './file'
import Member from './member'
import Page from './page'
import db from '../../server/db'
import config from '../../../config'

beforeEach(async () => {
  const tables = [ 'members', 'files', 'pages', 'changes' ]
  for (const table of tables) {
    await db.run(`DELETE FROM ${table};`)
    await db.run(`ALTER TABLE ${table} AUTO_INCREMENT=1;`)
  }

  await db.run('INSERT INTO members (name, email) VALUES (\'Normal\', \'normal@thefifthworld.com\');')
})

describe('File', () => {
  it('can upload a file', async () => {
    expect.assertions(1)
    try {
      const member = await Member.get(1, db)
      const page = await Page.create({
        title: 'New Page',
        body: 'This is a new page.'
      }, member, 'Initial text', db)
      const file = {
        name: 'test.txt',
        data: `${Date.now()}`,
        mimetype: 'text/plain',
        size: `${Date.now()}`.length
      }

      const actual = []
      const res = await File.upload(file, page, member, db)
      const check = await axios.get(`https://s3.${config.aws.region}.amazonaws.com/${config.aws.bucket}/${res.name}`)
      actual.push(check)
      actual.push(res.page === page.id)
      actual.push(res.uploader === member.id)
      expect(actual.every(val => val)).toEqual(true)
    } catch (err) {
      expect(err).toEqual(null)
    }
  })
})

afterEach(async () => {
  const tables = [ 'members', 'files', 'pages', 'changes' ]
  for (const table of tables) {
    await db.run(`DELETE FROM ${table};`)
    await db.run(`ALTER TABLE ${table} AUTO_INCREMENT=1;`)
  }
})
