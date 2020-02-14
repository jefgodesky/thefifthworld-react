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
