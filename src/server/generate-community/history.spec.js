/* global describe, it, expect */

import History from './history'

describe('History', () => {
  describe('constructor', () => {
    it('creates a record object', () => {
      const h = new History()
      expect(typeof h).toEqual('object')
    })
  })

  describe('add', () => {
    it('adds an event', () => {
      const h = new History()
      h.add(2020, { test: true })
      expect(h.record[2020][0].test).toEqual(true)
    })

    it('can record multiple events for a single year', () => {
      const h = new History()
      h.add(2020, { test: 1 })
      h.add(2020, { test: 2 })
      expect(h.record[2020].length).toEqual(2)
    })

    it('keeps events in order', () => {
      const h = new History()
      h.add(2020, { test: 1 })
      h.add(2020, { test: 2 })
      expect(h.record[2020][1].test).toEqual(2)
    })

    it('will not add a duplicative event', () => {
      const h = new History()
      h.add(2020, { test: true })
      h.add(2020, { test: true })
      expect(h.record[2020]).toEqual([ { test: true } ])
    })
  })

  describe('getEarliest', () => {
    it('returns the earliest year in the history', () => {
      const h = new History()
      h.add(2019, { test: true })
      h.add(2020, { test: true })
      expect(h.getEarliest()).toEqual(2019)
    })

    it('returns undefined if the history is empty', () => {
      const h = new History()
      expect(h.getEarliest()).toEqual(undefined)
    })
  })

  describe('getYear', () => {
    it('returns an empty array if asked for a year with no events', () => {
      const h = new History()
      expect(h.getYear(2020)).toEqual([])
    })

    it('returns the records for a given year', () => {
      const h = new History()
      h.add(2020, { test: true })
      expect(h.getYear(2020).length).toEqual(1)
    })

    it('adds the year to the event object', () => {
      const h = new History()
      h.add(2020, { test: true })
      expect(h.getYear(2020)[0].year).toEqual(2020)
    })
  })

  describe('getYears', () => {
    it('returns the events within a range of years', () => {
      const h = new History()
      h.add(2016, { test: true })
      h.add(2017, { test: true })
      h.add(2018, { test: true })
      h.add(2019, { test: true })
      h.add(2020, { test: true })
      expect(h.getYears([ 2017, 2019 ]).length).toEqual(3)
    })

    it('disregards non-numbers', () => {
      const h = new History()
      h.add(2020, { test: true })
      expect(h.getYears([ 2020, false, 2020 ]).length).toEqual(1)
    })

    it('can work off of just one number', () => {
      const h = new History()
      h.add(2020, { test: true })
      expect(h.getYears([ 2020 ]).length).toEqual(1)
    })

    it('returns an empty array if not given at least one number', () => {
      const h = new History()
      h.add(2020, { test: true })
      expect(h.getYears([ false ])).toEqual([])
    })
  })

  describe('get', () => {
    it('can get records for a particular year', () => {
      const h = new History()
      h.add(2020, { test: true })
      const expected = h.getYear(2020)
      expect(h.get({ year: 2020 })).toEqual(expected)
    })

    it('can get records for a range of years', () => {
      const h = new History()
      h.add(2016, { test: true })
      h.add(2017, { test: true })
      h.add(2018, { test: true })
      h.add(2019, { test: true })
      h.add(2020, { test: true })
      const expected = h.getYears([ 2017, 2019 ])
      expect(h.get({ year: [ 2017, 2019 ] })).toEqual(expected)
    })
  })

  describe('combine', () => {
    it('combines multiple histories', () => {
      const h1 = new History()
      const h2 = new History()
      h1.add(2020, { test: 1 })
      h2.add(2020, { test: 2 })
      const h = History.combine(h1, h2)
      expect(h.record[2020].length).toEqual(2)
    })

    it('eliminates duplicate events', () => {
      const h1 = new History()
      const h2 = new History()
      h1.add(2020, { test: true })
      h2.add(2020, { test: true })
      const h = History.combine(h1, h2)
      console.log(h.record)
      expect(h.record[2020].length).toEqual(1)
    })
  })
})
