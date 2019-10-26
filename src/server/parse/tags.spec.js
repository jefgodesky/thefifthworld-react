/* global describe, it, expect */

import { parseTags, parseTag, parseLocation, parseType } from './tags'

describe('parseTags', () => {
  it('can parse all of the tags in text', () => {
    const actual = parseTags('This is text. [[Tag1:Value1]] [[Tag1:Value2]] [[Tag2:Value]] [[Tag3:Val]]')
    const expected = {
      Tag1: [ 'Value1', 'Value2' ],
      Tag2: 'Value',
      Tag3: 'Val'
    }
    expect(actual).toEqual(expected)
  })
})

describe('parseTag', () => {
  it('returns the value of a tag', () => {
    const actual = parseTag('This is text. [[Tag:Value]]', 'Tag')
    expect(actual).toEqual('Value')
  })

  it('returns an array of values when appropriate', () => {
    const actual = parseTag('This is text. [[Tag:Value1]] [[Tag:Value2]] [[Tag:Value3]]', 'Tag')
    expect(actual).toEqual([ 'Value1', 'Value2', 'Value3' ])
  })

  it('can return just the first value matched', () => {
    const actual = parseTag('This is text. [[Tag:Value1]] [[Tag:Value2]] [[Tag:Value3]]', 'Tag', true)
    expect(actual).toEqual('Value1')
  })
})

describe('parseLocation', () => {
  it('returns latitude and longitude', () => {
    const actual = parseLocation('This is text. [[Location:19.692293, 98.843654]]')
    expect(actual.lat + actual.lon).toBeCloseTo(19.692293 + 98.843654)
  })
})

describe('parseType', () => {
  it('returns the type', () => {
    const actual = parseType('This is text. [[Type:Test]]')
    expect(actual).toEqual('Test')
  })

  it('returns the first type provided', () => {
    const actual = parseType('This is text. [[Type:Test]] [[Type:Something else]]')
    expect(actual).toEqual('Test')
  })

  it('returns "Place" if the text includes a location, regardless of type specified', () => {
    const actual = parseType('This is text. [[Type:Test]] [[Location:19.692293, 98.843654]]')
    expect(actual).toEqual('Place')
  })
})
