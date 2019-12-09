/* global describe, it, expect */

import Pair from './pair'
import Person from './person'

describe('Pair', () => {
  describe('constructor', () => {
    it('returns false if not given two people', () => {
      const t1 = new Pair()
      const t2 = new Pair(1)
      const t3 = new Pair(1, 2)
      const p = new Person()
      const t4 = new Pair(p)
      const t5 = new Pair(p, 1)
      expect(!t1 && !t2 && !t3 && !t4 && !t5)
    })

    it('creates a new pair', () => {
      const p1 = new Person()
      const p2 = new Person()
      const pair = new Pair(p1, p2)
      expect(pair.constructor.name).toEqual('Pair')
    })

    it('provides a love score', () => {
      const p1 = new Person()
      const p2 = new Person()
      const pair = new Pair(p1, p2)
      expect(typeof pair.love).toEqual('number')
    })

    it('records the pairing for both persons', () => {
      const p1 = new Person()
      const p2 = new Person()
      new Pair(p1, p2)
      expect(p1.pairs.length + p2.pairs.length).toEqual(2)
    })

    it('creates a symmetrical pair object', () => {
      const p1 = new Person()
      const p2 = new Person()
      new Pair(p1, p2)
      p1.pairs[0].test = true
      expect(p2.pairs[0].test).toEqual(true)
    })
  })
})
