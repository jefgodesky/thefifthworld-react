/* global describe, it, expect */

import axios from 'axios'
import upload from './upload'

describe('Upload', () => {
  it('can upload a file', async () => {
    expect.assertions(1)
    try {
      const file = {
        name: 'test.txt',
        data: `${Date.now()}`,
        mimetype: 'text/plain'
      }
      const actual = []
      const res = await upload(file)
      const check = await axios.get(res.Location)
      actual.push(check.data.toString() === file.data)
      expect(actual.every(val => val)).toEqual(true)
    } catch (err) {
      expect(err).toEqual(null)
    }
  })
})
