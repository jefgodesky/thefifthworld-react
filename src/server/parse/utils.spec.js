/* global describe, it, expect */

import { getURL, getProps } from './utils'

describe('getURL', () => {
  it('returns a full AWS S3 link', async () => {
    const actual = getURL('path/to/thing')
    const expected = 'https://s3.us-east-2.amazonaws.com/thefifthworld-test/path/to/thing'
    expect(actual).toEqual(expected)
  })
})

describe('getProps', () => {
  it('returns properties from a template', async () => {
    const tpl = ' prop1="value" somethingElse="hello" then we have some bad text in here, too'
    const actual = getProps(tpl)
    const expected = {
      prop1: 'value',
      somethingElse: 'hello'
    }
    expect(actual).toEqual(expected)
  })

  it('is not case sensitive', async () => {
    const tpl = ' Prop1="value" somethingElse="hello" then we have some bad text in here, too'
    const actual = getProps(tpl)
    const expected = {
      prop1: 'value',
      somethingElse: 'hello'
    }
    expect(actual).toEqual(expected)
  })
})
