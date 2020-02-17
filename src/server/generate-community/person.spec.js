/* global describe, it, expect */

import Person from './person'

import { daysFromNow } from '../../shared/utils'

describe('Person', () => {
  describe('constructor', () => {
    it('sets a birth date', () => {
      const p = new Person()
      expect(p.born instanceof Date).toEqual(true)
    })
  })
})
