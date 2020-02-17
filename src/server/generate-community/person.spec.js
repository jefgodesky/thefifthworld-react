/* global describe, it, expect */

import Person from './person'

import { daysFromNow, formatDate } from '../../shared/utils'

describe('Person', () => {
  describe('constructor', () => {
    it('sets a birth date', () => {
      const p = new Person()
      expect(p.born instanceof Date).toEqual(true)
    })

    it('defaults birth date to 144,000 days from today', () => {
      const p = new Person()
      const expected = formatDate(daysFromNow(144000))
      expect(formatDate(p.born)).toBe(expected)
    })
  })
})
