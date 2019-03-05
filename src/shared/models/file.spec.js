/* global describe, it, expect, beforeEach, afterEach */

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
  it('can upload, update, and delete a file', async () => {
    expect.assertions(1)
    try {
      const member = await Member.get(1, db)
      const page = await Page.create({
        title: 'New Page',
        body: 'This is a new page.'
      }, member, 'Initial text', db)
      const file1 = {
        name: 'test.txt',
        data: `${Date.now()}`,
        mimetype: 'text/plain',
        size: `${Date.now()}`.length
      }

      const actual = []
      const res = await File.upload(file1, page, member, db)
      let url = `https://s3.${config.aws.region}.amazonaws.com/${config.aws.bucket}/${res.name}`
      const check1 = await axios.get(url)
      actual.push(check1)
      actual.push(res.page === page.id)
      actual.push(res.uploader === member.id)

      const file2 = {
        name: 'test.txt',
        data: `${Date.now()}`,
        mimetype: 'text/plain',
        size: `${Date.now()}`.length
      }
      const update = await File.update(file2, page, member, db)
      const check2 = await db.run(`SELECT id FROM files WHERE page=${page.id};`)
      actual.push(check2.length === 1)
      url = `https://s3.${config.aws.region}.amazonaws.com/${config.aws.bucket}/${update.name}`
      const check3 = await axios.get(url)
      actual.push(check3)

      const check4 = await File.delete(update.name, db)
      actual.push(check4)
      try {
        const r = await axios.get(url)
        console.log(r)
        expect(true).toEqual(false)
      } catch (err) {
        actual.push(err && err.response && err.response.status && err.response.status === 403)
        const check5 = await File.get(res.name, db)
        actual.push(check5 === null)
        expect(actual.every(val => val)).toEqual(true)
      }
    } catch (err) {
      console.error(err)
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
