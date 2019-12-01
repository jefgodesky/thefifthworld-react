/* global describe, it, expect */

import Personality from './personality'
import { clone } from '../../shared/utils'

describe('Personality', () => {
  describe('constructor', () => {
    it('sets a numerical value for each of the Big Five personality traits', () => {
      const p = new Personality()
      const actual = [
        typeof p.openness.value,
        typeof p.conscientiousness.value,
        typeof p.extraversion.value,
        typeof p.agreeableness.value,
        typeof p.neuroticism.value
      ]
      const expected = [ 'number', 'number', 'number', 'number', 'number' ]
      expect(actual).toEqual(expected)
    })
  })

  describe('distance', () => {
    it('returns the sum of all traits distances', () => {
      const a = new Personality()
      a.openness.value = 1
      a.conscientiousness.value = 1
      a.extraversion.value = 1
      a.agreeableness.value = 1
      a.neuroticism.value = 1

      const b = new Personality()
      b.openness.value = 0
      b.conscientiousness.value = 1
      b.extraversion.value = 0
      b.agreeableness.value = 1
      b.neuroticism.value = 0

      const actual = a.distance(b)
      expect(actual).toEqual(3)
    })
  })

  describe('change', () => {
    it('can increase a trait', () => {
      const p = new Personality()
      const before = clone(p)
      p.change('+openness')
      const actual = [
        p.openness.value > before.openness.value,
        p.conscientiousness.value === before.conscientiousness.value,
        p.extraversion.value === before.extraversion.value,
        p.agreeableness.value === before.agreeableness.value,
        p.neuroticism.value === before.neuroticism.value
      ].reduce((acc, curr) => acc && curr, true)
      expect(actual).toEqual(true)
    })

    it('can decrease a trait', () => {
      const p = new Personality()
      const before = clone(p)
      p.change('-openness')
      const actual = [
        p.openness.value < before.openness.value,
        p.conscientiousness.value === before.conscientiousness.value,
        p.extraversion.value === before.extraversion.value,
        p.agreeableness.value === before.agreeableness.value,
        p.neuroticism.value === before.neuroticism.value
      ].reduce((acc, curr) => acc && curr, true)
      expect(actual).toEqual(true)
    })

    it('can make a random change', () => {
      const p = new Personality()
      const sum = p => {
        const o = p.openness.value
        const c = p.conscientiousness.value
        const e = p.extraversion.value
        const a = p.agreeableness.value
        const n = p.neuroticism.value
        return o + c + e + a + n
      }

      const before = sum(p)
      p.change()
      const after = sum(p)
      expect(before).not.toEqual(after)
    })
  })
})
