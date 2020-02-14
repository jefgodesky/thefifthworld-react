/* global describe, it, expect */

import Personality from './personality'

import { pickRandom } from './utils'

describe('Personality', () => {
  describe('constructor', () => {
    it('assigns a random openness score', () => {
      const p = new Personality()
      expect(!isNaN(p.openness)).toEqual(true)
    })

    it('can be given an openness score', () => {
      const p = new Personality({ openness: 0 })
      expect(p.openness).toEqual(0)
    })

    it('assigns a random conscientiousness score', () => {
      const p = new Personality()
      expect(!isNaN(p.conscientiousness)).toEqual(true)
    })

    it('can be given a conscientiousness score', () => {
      const p = new Personality({ conscientiousness: 0 })
      expect(p.conscientiousness).toEqual(0)
    })

    it('assigns a random extraversion score', () => {
      const p = new Personality()
      expect(!isNaN(p.extraversion)).toEqual(true)
    })

    it('can be given an extraversion score', () => {
      const p = new Personality({ extraversion: 0 })
      expect(p.extraversion).toEqual(0)
    })

    it('assigns a random agreeableness score', () => {
      const p = new Personality()
      expect(!isNaN(p.agreeableness)).toEqual(true)
    })

    it('can be given an agreeableness score', () => {
      const p = new Personality({ agreeableness: 0 })
      expect(p.agreeableness).toEqual(0)
    })

    it('assigns a random neuroticism score', () => {
      const p = new Personality()
      expect(!isNaN(p.neuroticism)).toEqual(true)
    })

    it('can be given a neuroticism score', () => {
      const p = new Personality({ neuroticism: 0 })
      expect(p.neuroticism).toEqual(0)
    })
  })

  describe('chance', () => {
    it('returns 50 for someone with a perfectly average trait', () => {
      const p = new Personality({ openness: 0 })
      expect(p.chance('openness')).toEqual(50)
    })

    it('returns -1 if you\'re not asking about a valid trait', () => {
      const p = new Personality()
      expect(p.chance('funkiness')).toEqual(-1)
    })

    it('returns something greater than zero for a valid trait', () => {
      const p = new Personality()
      const trait = pickRandom(p.traits)
      expect(p.chance(trait)).toBeGreaterThanOrEqual(0)
    })

    it('returns something less than 100 for a valid trait', () => {
      const p = new Personality()
      const trait = pickRandom(p.traits)
      expect(p.chance(trait)).toBeLessThanOrEqual(100)
    })
  })

  describe('check', () => {
    it('returns a boolean', () => {
      const p = new Personality()
      const trait = pickRandom(p.traits)
      expect(typeof p.check(trait)).toEqual('boolean')
    })

    it('is more likely when you have a high trait value', () => {
      const p = new Personality({ openness: 2 })
      let yes = 0
      let no = 0
      for (let i = 0; i < 100; i++) {
        if (p.check('openness')) { yes++ } else { no++ }
      }
      expect(yes).toBeGreaterThan(no)
    })

    it('is less likely when you have a low trait value', () => {
      const p = new Personality({ openness: -2 })
      let yes = 0
      let no = 0
      for (let i = 0; i < 100; i++) {
        if (p.check('openness')) { yes++ } else { no++ }
      }
      expect(no).toBeGreaterThan(yes)
    })
  })
})
