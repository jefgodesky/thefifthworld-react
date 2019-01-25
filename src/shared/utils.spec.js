/* global describe, it, expect */

import { checkExists, get, formatDate, dedupe } from './utils'

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
