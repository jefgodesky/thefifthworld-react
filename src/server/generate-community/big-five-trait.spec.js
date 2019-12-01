/* global describe, it, expect */

import BigFiveTrait from './big-five-trait'

describe('BigFiveTrait', () => {
  describe('constructor', () => {
    it('assigns a number', () => {
      const trait = new BigFiveTrait()
      expect(typeof trait.value).toEqual('number')
    })
  })

  describe('incr', () => {
    it('increases the value', () => {
      const trait = new BigFiveTrait()
      const before = trait.value
      trait.incr()
      expect(before).toBeLessThan(trait.value)
    })
  })

  describe('decr', () => {
    it('decreases the value', () => {
      const trait = new BigFiveTrait()
      const before = trait.value
      trait.decr()
      expect(before).toBeGreaterThan(trait.value)
    })
  })

  describe('distance', () => {
    it('returns the difference between two traits', () => {
      const a = new BigFiveTrait()
      const b = new BigFiveTrait()
      a.value = 2
      b.value = 1
      expect(a.distance(b)).toEqual(1)
    })
  })
})
