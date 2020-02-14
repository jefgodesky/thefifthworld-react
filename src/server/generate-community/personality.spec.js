/* global describe, it, expect */

import Personality from './personality'

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
})
