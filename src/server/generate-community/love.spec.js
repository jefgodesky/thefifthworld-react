/* global describe, it, expect */

import Person from './person'

import { encounter } from './love'

describe('encounter', () => {
  it('returns a boolean for mutual sexual attraction', () => {
    const a = new Person()
    const b = new Person()
    const report = encounter(a, b)
    expect(typeof report.sexual).toEqual('boolean')
  })

  it('returns mutual sexual attraction between two random people more than 5% of the time', () => {
    let count = 0
    for (let i = 0; i < 100; i++) {
      const a = new Person()
      const b = new Person()
      const report = encounter(a, b)
      if (report.sexual) count++
    }
    expect(count).toBeGreaterThan(5)
  })

  it('returns mutual sexual attraction between two random people less than 25% of the time', () => {
    let count = 0
    for (let i = 0; i < 100; i++) {
      const a = new Person()
      const b = new Person()
      const report = encounter(a, b)
      if (report.sexual) count++
    }
    expect(count).toBeLessThan(25)
  })

  it('returns a boolean for mutually liking each other', () => {
    const a = new Person()
    const b = new Person()
    const report = encounter(a, b)
    expect(typeof report.other).toEqual('boolean')
  })

  it('returns mutual bond between two random people more than 10% of the time', () => {
    let count = 0
    for (let i = 0; i < 100; i++) {
      const a = new Person()
      const b = new Person()
      const report = encounter(a, b)
      if (report.other) count++
    }
    expect(count).toBeGreaterThan(10)
  })

  it('returns mutual bond between two random people less than 50% of the time', () => {
    let count = 0
    for (let i = 0; i < 100; i++) {
      const a = new Person()
      const b = new Person()
      const report = encounter(a, b)
      if (report.sexual) count++
    }
    expect(count).toBeLessThan(50)
  })

  it('returns a boolean for whether a was sexually attracted to b', () => {
    const a = new Person()
    const b = new Person()
    const report = encounter(a, b)
    expect(typeof report.a.sexual).toEqual('boolean')
  })

  it('returns a boolean for whether a liked b', () => {
    const a = new Person()
    const b = new Person()
    const report = encounter(a, b)
    expect(typeof report.a.other).toEqual('boolean')
  })

  it('returns a boolean for whether b was sexually attracted to a', () => {
    const a = new Person()
    const b = new Person()
    const report = encounter(a, b)
    expect(typeof report.b.sexual).toEqual('boolean')
  })

  it('returns a boolean for whether b liked a', () => {
    const a = new Person()
    const b = new Person()
    const report = encounter(a, b)
    expect(typeof report.b.other).toEqual('boolean')
  })
})
