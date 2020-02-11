/* global describe, it, expect */

import History from './history'

describe('History', () => {
  describe('constructor', () => {
    it('creates an array', () => {
      const h = new History()
      expect(h.record).toEqual([])
    })
  })

  describe('add', () => {
    it('adds an entry to the history', () => {
      const h = new History()
      const entry = { year: 2020, tags: [ 'test' ] }
      h.add(entry)
      expect(h.record).toEqual([ entry ])
    })
  })

  describe('get', () => {
    it('returns all entries for a given year', () => {
      const h = new History()
      h.add({ year: 2019, tags: [ 'test1' ] })
      h.add({ year: 2020, tags: [ 'test1' ] })
      h.add({ year: 2020, tags: [ 'test2' ] })
      const actual = h.get({ year: 2020 })
      expect(actual.length).toEqual(2)
    })

    it('returns all entries with a given tag', () => {
      const h = new History()
      h.add({ year: 2019, tags: [ 'test1' ] })
      h.add({ year: 2020, tags: [ 'test1' ] })
      h.add({ year: 2020, tags: [ 'test2' ] })
      const actual = h.get({ tag: 'test1' })
      expect(actual.length).toEqual(2)
    })

    it('returns all entries with one of a set of tags', () => {
      const h = new History()
      h.add({ year: 2019, tags: [ 'test1' ] })
      h.add({ year: 2020, tags: [ 'test1' ] })
      h.add({ year: 2020, tags: [ 'test2' ] })
      const actual = h.get({ tags: [ 'test1', 'test2' ] })
      expect(actual.length).toEqual(3)
    })

    it('combines single tag and array of tags', () => {
      const h = new History()
      h.add({ year: 2019, tags: [ 'test1' ] })
      h.add({ year: 2020, tags: [ 'test1' ] })
      h.add({ year: 2020, tags: [ 'test2' ] })
      const actual = h.get({ tag: 'test1', tags: [ 'test2' ] })
      expect(actual.length).toEqual(3)
    })

    it('returns entries between two years (inclusive)', () => {
      const h = new History()
      const entries = [
        { year: 2012, tags: [ 'test' ] },
        { year: 2013, tags: [ 'test' ] },
        { year: 2014, tags: [ 'test' ] },
        { year: 2015, tags: [ 'nope' ] },
        { year: 2016, tags: [ 'test' ] },
        { year: 2017, tags: [ 'test' ] }
      ]
      entries.forEach(e => h.add(e))
      expect(h.get({ between: [ 2014, 2016 ] }).length).toEqual(3)
    })

    it('combines interval and tags', () => {
      const h = new History()
      const entries = [
        { year: 2012, tags: [ 'test' ] },
        { year: 2013, tags: [ 'test' ] },
        { year: 2014, tags: [ 'test' ] },
        { year: 2015, tags: [ 'nope' ] },
        { year: 2016, tags: [ 'test' ] },
        { year: 2017, tags: [ 'test' ] }
      ]
      entries.forEach(e => h.add(e))
      expect(h.get({ between: [ 2014, 2016 ], tag: 'test' }).length).toEqual(2)
    })

    it('returns only those entries that match the year and at least one tag', () => {
      const h = new History()
      h.add({ year: 2019, tags: [ 'test1' ] })
      h.add({ year: 2020, tags: [ 'test1' ] })
      h.add({ year: 2020, tags: [ 'test2' ] })
      const actual = h.get({ year: 2020, tags: [ 'test1' ] })
      expect(actual.length).toEqual(1)
    })

    it('returns the entire record if not given appropriate criteria', () => {
      const h = new History()
      const entries = [
        { year: 2019, tags: [ 'test1' ] },
        { year: 2020, tags: [ 'test1' ] },
        { year: 2020, tags: [ 'test2' ] }
      ]
      entries.forEach(e => h.add(e))
      expect(h.get({})).toEqual(entries)
    })
  })

  describe('wasQuiet', () => {
    it('returns true if nothing happened that year', () => {
      const h = new History()
      const entries = [
        { year: 2019, tags: [ 'test1' ] },
        { year: 2020, tags: [ 'test1' ] },
        { year: 2020, tags: [ 'test2' ] }
      ]
      entries.forEach(e => h.add(e))
      expect(h.wasQuiet(2018)).toEqual(true)
    })

    it('returns false if something happened that year', () => {
      const h = new History()
      const entries = [
        { year: 2019, tags: [ 'test1' ] },
        { year: 2020, tags: [ 'test1' ] },
        { year: 2020, tags: [ 'test2' ] }
      ]
      entries.forEach(e => h.add(e))
      expect(h.wasQuiet(2019)).toEqual(false)
    })
  })
})
