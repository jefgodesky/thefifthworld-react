/* global describe, it, expect */

import BigFiveTrait from './big-five-trait'

describe('BigFiveTrait', () => {
  describe('constructor', () => {
    it('assigns a number', () => {
      const trait = new BigFiveTrait()
      expect(typeof trait.value).toEqual('number')
    })

    it('has an average near zero', () => {
      const all = []
      for (let i = 0; i < 100; i++) {
        const trait = new BigFiveTrait()
        all.push(trait.value)
      }
      const avg = all.reduce((acc, curr) => acc + curr, 0) / 100
      const notTooBig = avg < 1
      const notTooSmall = avg > -1
      expect(notTooBig && notTooSmall)
    })
  })

  describe('isBelow', () => {
    it('returns true if the value is less than the given number', () => {
      const trait = new BigFiveTrait()
      trait.value = 0
      expect(trait.isBelow(1)).toEqual(true)
    })

    it('returns false if the value is not less than the given number', () => {
      const trait = new BigFiveTrait()
      trait.value = 0
      expect(trait.isBelow(-1)).toEqual(false)
    })

    it('returns false if the value is equal to the given number', () => {
      const trait = new BigFiveTrait()
      trait.value = 0
      expect(trait.isBelow(0)).toEqual(false)
    })
  })

  describe('isAbove', () => {
    it('returns true if the value is greater than the given number', () => {
      const trait = new BigFiveTrait()
      trait.value = 0
      expect(trait.isAbove(-1)).toEqual(true)
    })

    it('returns false if the value is not greater than the given number', () => {
      const trait = new BigFiveTrait()
      trait.value = 0
      expect(trait.isAbove(1)).toEqual(false)
    })

    it('returns false if the value is equal to the given number', () => {
      const trait = new BigFiveTrait()
      trait.value = 0
      expect(trait.isAbove(0)).toEqual(false)
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
