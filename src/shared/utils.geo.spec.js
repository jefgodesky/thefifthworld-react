/* global describe, it, expect */

import {
  convertLat,
  convertLon,
  convertCoords
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

describe('convertLonn', () => {
  it('will keep a decimal format latitude', () => {
    const lon = -80.012770
    const actual = convertLon(lon)
    expect(actual).toEqual(lon)
  })

  it('will turn a string into a decimal value', () => {
    const lon = '-80.012770'
    const actual = convertLon(lon)
    expect(actual).toEqual(-80.012770)
  })

  it('will turn a latitude in degrees, minutes, and seconds into a decimal value', () => {
    const lon = '80°00\'46.0"W'
    const actual = convertLon(lon)
    expect(actual).toBeCloseTo(-80.012770, 3)
  })

  it('works with ticks', () => {
    const lon = '80`00\'46.0"W'
    const actual = convertLon(lon)
    expect(actual).toBeCloseTo(-80.012770, 3)
  })

  it('works with just degrees and minutes', () => {
    const lon = '80°00\'W'
    const actual = convertLon(lon)
    expect(actual).toBeCloseTo(-80.000, 3)
  })

  it('works with just degrees', () => {
    const lon = '80°W'
    const actual = convertLon(lon)
    expect(actual).toBeCloseTo(-80.000, 3)
  })
})

describe('convertCoords', () => {
  it('will keep a decimal format latitude', () => {
    const coords = { lat: 40.441810, lon: -80.012770 }
    const actual = convertCoords(coords)
    expect(actual).toEqual(coords)
  })

  it('will turn a string into a decimal value', () => {
    const coords = { lat: '40.441810', lon: '-80.012770' }
    const actual = convertCoords(coords)
    expect(actual).toEqual({ lat: 40.441810, lon: -80.012770 })
  })

  it('will turn a latitude in degrees, minutes, and seconds into a decimal value', () => {
    const coords = { lat: '40°26\'30.5"N', lon: '80°00\'46.0"W' }
    const actual = convertCoords(coords)
    expect(actual.lat).toBeCloseTo(40.441794, 3)
    expect(actual.lon).toBeCloseTo(-80.012770, 3)
  })

  it('works with ticks', () => {
    const coords = { lat: '40`26\'30.5"N', lon: '80`00\'46.0"W' }
    const actual = convertCoords(coords)
    expect(actual.lat).toBeCloseTo(40.441794, 3)
    expect(actual.lon).toBeCloseTo(-80.012770, 3)
  })
})
