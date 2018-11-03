/* global describe, it, expect */

import { checkExists, get } from './utils'

describe('checkExists', () => {
  it('can tell if a chain of properties exist', () => {
    const obj = { prop: true }
    const actual = [ checkExists(obj, 'prop'), checkExists(obj, 'prop.nope') ]
    const expected = [ true, false ]
    expect(actual).toEqual(expected)
  })
})

describe('get', () => {
  it('can return a value from a chain of properties', () => {
    const obj = { prop: 42 }
    const actual = [ get(obj, 'prop'), get(obj, 'prop.nope') ]
    const expected = [ 42, undefined ]
    expect(actual).toEqual(expected)
  })
})