/* global describe, it, expect */

import {
  convertLat
} from './utils.geo'

describe('convertLat', () => {
  it('will keep a decimal format latitude', () => {
    const lat = 40.441810
    const actual = convertLat(lat)
    expect(actual).toEqual(lat)
  })

  it('will turn a string into a decimal value', () => {
    const lat = '40.441810'
    const actual = convertLat(lat)
    expect(actual).toEqual(40.441810)
  })

  it('will turn a latitude in degrees, minutes, and seconds into a decimal value', () => {
    const lat = '40°26\'30.5"N'
    const actual = convertLat(lat)
    expect(actual).toBeCloseTo(40.441794, 3)
  })

  it('works with ticks', () => {
    const lat = '40`26\'30.5"N'
    const actual = convertLat(lat)
    expect(actual).toBeCloseTo(40.441794, 3)
  })

  it('works with just degrees and minutes', () => {
    const lat = '40°26\'N'
    const actual = convertLat(lat)
    expect(actual).toBeCloseTo(40.4333, 3)
  })

  it('works with just degrees', () => {
    const lat = '40°N'
    const actual = convertLat(lat)
    expect(actual).toBeCloseTo(40, 3)
  })
})
