/* global describe, it, expect */

import { checkExists } from './utils'

describe('checkExists', () => {
  it('can tell if a chain of properties exist', () => {
    const obj = {
      prop: true
    }
    const actual = [ checkExists(obj, 'prop'), checkExists(obj, 'prop.nope') ]
    const expected = [ true, false ]
    expect(actual).toEqual(expected)
  })
})