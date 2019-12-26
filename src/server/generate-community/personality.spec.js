/* global describe, it, expect */

import Community from './community'
import Person from './person'
import Personality from './personality'

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

  describe('expressPsychopathy', () => {
    it('increases openness to experience', () => {
      const p = new Personality()
      const before = p.openness.value
      p.expressPsychopathy()
      expect(before).toBeLessThan(p.openness.value)
    })

    it('decreases conscientiousness', () => {
      const p = new Personality()
      const before = p.conscientiousness.value
      p.expressPsychopathy()
      expect(before).toBeGreaterThan(p.conscientiousness.value)
    })

    it('increases extraversion', () => {
      const p = new Personality()
      const before = p.extraversion.value
      p.expressPsychopathy()
      expect(before).toBeLessThan(p.extraversion.value)
    })

    it('decreases agreeableness', () => {
      const p = new Personality()
      const before = p.agreeableness.value
      p.expressPsychopathy()
      expect(before).toBeGreaterThan(p.agreeableness.value)
    })

    it('increases neuroticism', () => {
      const p = new Personality()
      const before = p.neuroticism.value
      p.expressPsychopathy()
      expect(before).toBeLessThan(p.neuroticism.value)
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

  describe('getAverage', () => {
    it('returns the average value of a population', () => {
      const p1 = new Person()
      const p2 = new Person()
      const p3 = new Person()
      const p4 = new Person()
      p1.personality.openness.value = 0
      p2.personality.openness.value = 0
      p3.personality.openness.value = 0
      p4.personality.openness.value = 1
      expect(Personality.getAverage([ p1, p2, p3, p4 ], 'openness')).toEqual(0.25)
    })
  })

  describe('change', () => {
    it('will make a change', () => {
      const sum = p => {
        const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = p
        return openness.value + conscientiousness.value + extraversion.value + agreeableness.value + neuroticism.value
      }

      const c = new Community()
      const p = new Person()
      c.add(p)
      const before = sum(p.personality)
      p.personality.change(c)
      const after = sum(p.personality)
      expect(before).not.toEqual(after)
    })
  })

  describe('chance', () => {
    it('returns a probability based on a trait', () => {
      const p = new Personality()
      const trait = 'openness'
      p[trait].value = 0
      const t1 = p.chance(trait)
      p[trait].value = 3
      const t2 = p.chance(trait)
      p[trait].value = 6
      const t3 = p.chance(trait)
      p[trait].value = -3
      const t4 = p.chance(trait)
      p[trait].value = -6
      const t5 = p.chance(trait)
      const actual = [ t1, t2, t3, t4, t5 ]
      const expected = [ 48, 96, 99, 1, 1 ]
      expect(actual).toEqual(expected)
    })
  })

  describe('check', () => {
    it('returns a boolean', () => {
      const p = new Personality()
      const actual = p.check('openness')
      expect(typeof actual).toEqual('boolean')
    })

    it('is more likely to return false with a low value', () => {
      const p = new Personality()
      p.openness.value = -3
      const arr = []
      for (let i = 0; i < 100; i++) arr.push(p.check('openness'))
      const yes = arr.filter(x => x === true).length
      const no = arr.filter(x => x === false).length
      expect(no > yes)
    })

    it('is more likely to return true with a high value', () => {
      const p = new Personality()
      p.openness.value = 3
      const arr = []
      for (let i = 0; i < 100; i++) arr.push(p.check('openness'))
      const yes = arr.filter(x => x === true).length
      const no = arr.filter(x => x === false).length
      expect(yes > no)
    })
  })
})
