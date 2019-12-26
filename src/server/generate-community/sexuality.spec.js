/* global describe, it, expect */

import Body from './body'
import Sexuality from './sexuality'

describe('Sexuality', () => {
  describe('constructor', () => {
    it('assigns an androphilia score', () => {
      const b = new Body()
      const s = new Sexuality(b)
      expect(s.androphilia).toBeGreaterThanOrEqual(0)
    })

    it('assigns a libido score', () => {
      const b = new Body()
      const s = new Sexuality(b)
      expect(s.libido).toBeGreaterThanOrEqual(0)
    })

    it('assigns a gynephilia score', () => {
      const b = new Body()
      const s = new Sexuality(b)
      expect(s.gynephilia).toBeGreaterThanOrEqual(0)
    })

    it('assigns a skoliophilia score', () => {
      const b = new Body()
      const s = new Sexuality(b)
      expect(s.skoliophilia).toBeGreaterThanOrEqual(0)
    })
  })

  describe('isAsexual', () => {
    it('returns true if the person is asexual', () => {
      const b = new Body()
      const s = new Sexuality(b)
      s.libido = 0
      s.androphilia = 0
      s.gynephilia = 0
      s.skoliophilia = 0
      expect(s.isAsexual()).toEqual(true)
    })

    it('returns false if the person is not asexual', () => {
      const b = new Body()
      const s = new Sexuality(b)
      s.androphilia = 0
      s.gynephilia = 1
      s.skoliophilia = 0
      expect(s.isAsexual()).toEqual(false)
    })
  })

  describe('getGenderPreferences', () => {
    it('returns an array of genders for a two-gender society', () => {
      const valid = [ 'Woman', 'Man' ]
      const b = new Body()
      const s = new Sexuality(b)
      const genders = s.getGenderPreferences(2, 25)
      const actual = genders.map(g => valid.includes(g)).reduce((acc, curr) => acc && curr, true)
      expect(actual)
    })

    it('returns an array of genders for a three-gender society', () => {
      const valid = [ 'Woman', 'Man', 'Third gender' ]
      const b = new Body()
      const s = new Sexuality(b)
      const genders = s.getGenderPreferences(3, 25)
      const actual = genders.map(g => valid.includes(g)).reduce((acc, curr) => acc && curr, true)
      expect(actual)
    })

    it('returns an array of genders for a four-gender society', () => {
      const valid = [ 'Feminine woman', 'Masculine woman', 'Feminine man', 'Masculine man' ]
      const b = new Body()
      const s = new Sexuality(b)
      const genders = s.getGenderPreferences(3, 25)
      const actual = genders.map(g => valid.includes(g)).reduce((acc, curr) => acc && curr, true)
      expect(actual)
    })

    it('returns an array of genders for a five-gender society', () => {
      const valid = [ 'Feminine woman', 'Masculine woman', 'Fifth gender', 'Feminine man', 'Masculine man' ]
      const b = new Body()
      const s = new Sexuality(b)
      const genders = s.getGenderPreferences(3, 25)
      const actual = genders.map(g => valid.includes(g)).reduce((acc, curr) => acc && curr, true)
      expect(actual)
    })
  })
})
