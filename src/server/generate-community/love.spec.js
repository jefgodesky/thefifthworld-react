/* global describe, it, expect */

import Community from './community'
import Person from './person'

import { encounter, commitAdultery } from './love'

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

describe('commitAdultery', () => {
  it('adds an incident of adultery to the polycule history', () => {
    const community = new Community()
    const a = new Person(community)
    const b = new Person()
    const c = new Person()
    const id = community.startPolycule(a, b)
    commitAdultery(a, c, community)
    expect(community.polycules[id].history.get({ tag: 'adultery' })).toHaveLength(1)
  })

  it('sometimes results in the polycule breaking up', () => {
    let count = 0
    for (let i = 0; i < 100; i++) {
      const community = new Community()
      const a = new Person(community)
      const b = new Person()
      const c = new Person()
      const d = new Person()
      const id = community.startPolycule(a, b, c)
      commitAdultery(c, d, community)
      if (community.polycules[id].history.get({ tag: 'breakup' }).length > 0) count++
    }
    expect(count).toBeGreaterThan(0)
  })

  it('results in the polycule breaking up less than 25% of the time', () => {
    let count = 0
    for (let i = 0; i < 100; i++) {
      const community = new Community()
      const a = new Person(community)
      const b = new Person()
      const c = new Person()
      const d = new Person()
      const id = community.startPolycule(a, b, c)
      commitAdultery(c, d, community)
      if (community.polycules[id].history.get({ tag: 'breakup' }).length > 0) count++
    }
    expect(count).toBeLessThanOrEqual(25)
  })

  it('sometimes results in the adulterers being removed', () => {
    let count = 0
    for (let i = 0; i < 100; i++) {
      const community = new Community()
      const a = new Person(community)
      const b = new Person()
      const c = new Person()
      const d = new Person()
      const id = community.startPolycule(a, b, c)
      commitAdultery(c, d, community)
      if (community.polycules[id].history.get({ tag: 'contracted' }).length > 0) count++
    }
    expect(count).toBeGreaterThan(0)
  })

  it('results in the adulterers being removed less than 35% of the time', () => {
    let count = 0
    for (let i = 0; i < 100; i++) {
      const community = new Community()
      const a = new Person(community)
      const b = new Person()
      const c = new Person()
      const d = new Person()
      const id = community.startPolycule(a, b, c)
      commitAdultery(c, d, community)
      if (community.polycules[id].history.get({ tag: 'contracted' }).length > 0) count++
    }
    expect(count).toBeLessThanOrEqual(35)
  })

  it('usually results in the polycule recovering', () => {
    let count = 0
    for (let i = 0; i < 100; i++) {
      const community = new Community()
      const a = new Person(community)
      const b = new Person()
      const c = new Person()
      const d = new Person()
      const id = community.startPolycule(a, b, c)
      commitAdultery(c, d, community)
      const records = community.polycules[id].history.get({ tag: 'adultery' })
      if (records[0].outcome === 'recovery') count++
    }
    expect(count).toBeGreaterThan(50)
  })
})
