/* global describe, it, expect */

import { checkExists, isPopulatedArray, get, formatDate, dedupe, getFileSizeStr, clone } from './utils'

describe('checkExists', () => {
  it('can tell if a chain of properties exist', () => {
    const obj = { prop: true }
    const actual = [ checkExists(obj, 'prop'), checkExists(obj, 'prop.nope') ]
    const expected = [ true, false ]
    expect(actual).toEqual(expected)
  })
})

describe('isPopulatedArray', () => {
  it('returns true if its param is an array with one or more items', () => {
    expect(isPopulatedArray([ 0 ])).toEqual(true)
  })

  it('returns false if its param is an array with zero items', () => {
    expect(isPopulatedArray([])).toEqual(false)
  })

  it('returns false if its param is not an array', () => {
    expect(isPopulatedArray('hello')).toEqual(false)
  })

  it('returns false if its param is null', () => {
    expect(isPopulatedArray(null)).toEqual(false)
  })

  it('returns false if its param is undefined', () => {
    expect(isPopulatedArray(undefined)).toEqual(false)
  })

  it('returns false if its param is false', () => {
    expect(isPopulatedArray(false)).toEqual(false)
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

describe('formatDate', () => {
  it('can format a date', () => {
    const date = new Date('November 11, 1918 11:11:11')
    const actual = formatDate(date)
    const expected = '11&nbsp;Nov&nbsp;1918 11:11&nbsp;AM'
    expect(actual).toEqual(expected)
  })

  it('can handle noon', () => {
    const date = new Date('July 4, 1776 12:30:00')
    const actual = formatDate(date)
    const expected = '4&nbsp;Jul&nbsp;1776 12:30&nbsp;PM'
    expect(actual).toEqual(expected)
  })

  it('can handle midnight', () => {
    const date = new Date('July 14, 1789 00:15:00')
    const actual = formatDate(date)
    const expected = '14&nbsp;Jul&nbsp;1789 12:15&nbsp;AM'
    expect(actual).toEqual(expected)
  })
})

describe('dedupe', () => {
  it('can deduplicate an arry', () => {
    const orig = [ 1, 1, 2, 3 ]
    const actual = dedupe(orig)
    expect(actual).toEqual([ 1, 2, 3 ])
  })

  it('does not mutate the array', () => {
    const orig = [ 1, 1, 2, 3 ]
    const deduped = dedupe(orig)
    const expected = {
      orig: [ 1, 1, 2, 3 ],
      deduped: [ 1, 2, 3 ]
    }
    const actual = { orig, deduped }
    expect(actual).toEqual(expected)
  })
})

describe('getFileSizeStr', () => {
  it('describes a file size', () => {
    const sizes = [ 900, 900000, 900000000, 1100000000 ]
    const actual = sizes.map(size => getFileSizeStr(size))
    const expected = [ '900 B', '900 kB', '900 MB', '1.1 GB' ]
    expect(actual).toEqual(expected)
  })
})

describe('clone', () => {
  it('can deep clone objects', () => {
    const obj = {
      param: {
        val: {
          nested: true
        }
      }
    }
    const c = clone(obj)
    expect(c).toEqual(obj)
  })

  it('can deep clone an array', () => {
    const arr = [
      { param: { val: { nested: true } } },
      { param: { otherVal: [ 1, 2, 3 ] } },
      'Hello',
      [ 4, 5, 6 ]
    ]
    const c = clone(arr)
    expect(c).toEqual(arr)
  })
})
