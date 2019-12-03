/* global describe, it, expect */

import Body from './body'
import Sexuality from './sexuality'
import tables from '../../data/community-creation'

describe('Sexuality', () => {
  describe('constructor', () => {
    it('assigns an androphilia score', () => {
      const b = new Body()
      const s = new Sexuality(b)
      expect(s.androphilia).toBeGreaterThanOrEqual(0)
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
