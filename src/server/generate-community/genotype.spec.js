/* global describe, it, expect */

import Body from './body'
import Genotype from './genotype'
import Personality from './personality'

import { pickRandom } from './utils'
import { allTrue, between } from '../../shared/utils'

describe('Genotype', () => {
  describe('constructor', () => {
    it('adds a body', () => {
      const g = new Genotype()
      expect(g.body && g.body.constructor && g.body.constructor.name === 'Body').toEqual(true)
    })

    it('copies a given body', () => {
      const b = new Body()
      const g = new Genotype(b)
      b.takeScar('concept of self')
      const tests = [
        g.body && g.body.constructor && g.body.constructor.name === 'Body',
        g.body.attractiveness === b.attractiveness,
        g.body.scars.length === 0,
        b.scars.length === 1
      ]
      expect(allTrue(tests)).toEqual(true)
    })

    it('adds a personality', () => {
      const g = new Genotype()
      const tests = [
        Boolean(g.personality),
        Boolean(g.personality.constructor),
        g.personality.constructor.name === 'Personality'
      ]
      expect(allTrue(tests)).toEqual(true)
    })

    it('copies a given personality', () => {
      const p = new Personality()
      const g = new Genotype(null, p)
      p.change()

      const deltas = [
        Math.abs(g.personality.openness - p.openness),
        Math.abs(g.personality.conscientiousness - p.conscientiousness),
        Math.abs(g.personality.extraversion - p.extraversion),
        Math.abs(g.personality.agreeableness - p.agreeableness),
        Math.abs(g.personality.neuroticism - p.neuroticism)
      ]

      const tests = [
        Boolean(g.personality),
        Boolean(g.personality.constructor),
        g.personality.constructor.name === 'Personality',
        deltas.filter(d => d !== 0).length === 1
      ]

      expect(allTrue(tests)).toEqual(true)
    })

    it('defaults to a viable offspring', () => {
      const g = new Genotype()
      expect(g.viable).toEqual(true)
    })
  })

  describe('modifyNormal', () => {
    it('increases or decreases a value by up to 10%', () => {
      const g = new Genotype()
      const actual = g.modifyNormal(1)
      expect(between(actual, 0.9, 1.1)).toEqual(actual)
    })

    it('increases or decreases a value by up to 10% of the given standard deviation', () => {
      const g = new Genotype()
      const actual = g.modifyNormal(100, 15)
      expect(between(actual, 98.5, 101.5)).toEqual(actual)
    })
  })

  describe('modify', () => {
    it('makes about 1% of children stillborn', () => {
      let count = 0
      for (let i = 0; i < 1000; i++) {
        const g = new Genotype()
        g.modify()
        if (!g.viable) count++
      }
      const tooMany = count > 20
      const tooFew = count === 0
      expect(!tooMany && !tooFew).toEqual(true)
    })

    it('varies longevity', () => {
      const g = new Genotype()
      const before = g.body.longevity
      g.modify()
      expect(g.body.longevity).not.toEqual(before)
    })

    it('varies attractiveness', () => {
      const g = new Genotype()
      const before = g.body.attractiveness
      g.modify()
      expect(g.body.attractiveness).not.toEqual(before)
    })

    it('varies body type', () => {
      const g = new Genotype()
      const before = g.body.type
      g.modify()
      expect(g.body.type).not.toEqual(before)
    })

    it('varies openness to new experiences', () => {
      const g = new Genotype()
      const before = g.personality.openness
      g.modify()
      expect(g.personality.openness).not.toEqual(before)
    })

    it('varies conscientiousness', () => {
      const g = new Genotype()
      const before = g.personality.conscientiousness
      g.modify()
      expect(g.personality.conscientiousness).not.toEqual(before)
    })

    it('varies extraversion', () => {
      const g = new Genotype()
      const before = g.personality.extraversion
      g.modify()
      expect(g.personality.extraversion).not.toEqual(before)
    })

    it('varies agreeableness', () => {
      const g = new Genotype()
      const before = g.personality.agreeableness
      g.modify()
      expect(g.personality.agreeableness).not.toEqual(before)
    })

    it('varies neuroticism', () => {
      const g = new Genotype()
      const before = g.personality.neuroticism
      g.modify()
      expect(g.personality.neuroticism).not.toEqual(before)
    })
  })

  describe('inheritDisabilities', () => {
    it('tests for and applies disabilities', () => {
      const a = new Genotype()
      const b = new Genotype()
      const c = new Genotype()
      c.inheritDisabilities(a, b)
      const possibilities = [ 'healthy', 'disabled', 'blind', 'deaf' ]
      const set = pickRandom([ 'eyes', 'ears', 'arms', 'legs' ])
      const side = pickRandom([ 'left', 'right' ])
      expect(possibilities.includes(c.body[set][side])).toEqual(true)
    })
  })

  describe('inheritAchondroplasia', () => {
    it('returns children without achondroplasia from two parents with it about 25% of the time', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const a = new Genotype()
        const b = new Genotype()
        const c = new Genotype()
        a.body.achondroplasia = true
        b.body.achondroplasia = true
        c.inheritAchondroplasia(a, b)
        if (!c.body.achondroplasia) count++
      }
      const tooFew = count < 10
      const tooMany = count > 40
      expect(!tooFew && !tooMany).toEqual(true)
    })

    it('returns children with achondroplasia from two parents with it about 75% of the time', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const a = new Genotype()
        const b = new Genotype()
        const c = new Genotype()
        a.body.achondroplasia = true
        b.body.achondroplasia = true
        c.inheritAchondroplasia(a, b)
        if (c.body.achondroplasia) count++
      }
      const tooFew = count < 60
      const tooMany = count > 90
      expect(!tooFew && !tooMany).toEqual(true)
    })

    it('returns non-viable children from two parents with achondroplasia about 25% of the time', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const a = new Genotype()
        const b = new Genotype()
        const c = new Genotype()
        a.body.achondroplasia = true
        b.body.achondroplasia = true
        c.inheritAchondroplasia(a, b)
        if (!c.viable) count++
      }
      const tooFew = count < 10
      const tooMany = count > 40
      expect(!tooFew && !tooMany).toEqual(true)
    })
  })

  describe('both', () => {
    it('returns true if both parents have a problem', () => {
      const a = new Genotype()
      const b = new Genotype()
      a.body.arms = { left: 'healthy', right: 'disabled' }
      b.body.arms = { left: 'healthy', right: 'disabled' }
      expect(Genotype.both('arms', a, b)).toEqual(true)
    })

    it('returns false if only one parent has a problem', () => {
      const a = new Genotype()
      const b = new Genotype()
      a.body.arms = { left: 'healthy', right: 'disabled' }
      b.body.arms = { left: 'healthy', right: 'healthy' }
      expect(Genotype.both('arms', a, b)).toEqual(false)
    })

    it('returns false if neither parent has a problem', () => {
      const a = new Genotype()
      const b = new Genotype()
      a.body.arms = { left: 'healthy', right: 'healthy' }
      b.body.arms = { left: 'healthy', right: 'healthy' }
      expect(Genotype.both('arms', a, b)).toEqual(false)
    })
  })

  describe('either', () => {
    it('returns true if both parents have a problem', () => {
      const a = new Genotype()
      const b = new Genotype()
      a.body.arms = { left: 'healthy', right: 'disabled' }
      b.body.arms = { left: 'healthy', right: 'disabled' }
      expect(Genotype.either('arms', a, b)).toEqual(true)
    })

    it('returns true if only one parent has a problem', () => {
      const a = new Genotype()
      const b = new Genotype()
      a.body.arms = { left: 'healthy', right: 'disabled' }
      b.body.arms = { left: 'healthy', right: 'healthy' }
      expect(Genotype.either('arms', a, b)).toEqual(true)
    })

    it('returns false if neither parent has a problem', () => {
      const a = new Genotype()
      const b = new Genotype()
      a.body.arms = { left: 'healthy', right: 'healthy' }
      b.body.arms = { left: 'healthy', right: 'healthy' }
      expect(Genotype.either('arms', a, b)).toEqual(false)
    })
  })

  describe('inheritDisability', () => {
    it('returns true about 75% of the time when both parents have the disability', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const a = new Genotype()
        const b = new Genotype()
        a.body.arms = { left: 'disabled', right: 'disabled' }
        b.body.arms = { left: 'disabled', right: 'disabled' }
        if (Genotype.inheritDisability('arms', a, b)) count++
      }
      const tooFew = count < 60
      const tooMany = count > 90
      expect(!tooMany && !tooFew).toEqual(true)
    })

    it('returns true about 25% of the time when just one parent has the disability', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const a = new Genotype()
        const b = new Genotype()
        a.body.arms = { left: 'disabled', right: 'disabled' }
        b.body.arms = { left: 'healthy', right: 'healthy' }
        if (Genotype.inheritDisability('arms', a, b)) count++
      }
      const tooFew = count < 10
      const tooMany = count > 40
      expect(!tooMany && !tooFew).toEqual(true)
    })
  })

  describe('descend', () => {
    it('returns a new genotype', () => {
      const a = new Genotype()
      const b = new Genotype()
      const c = Genotype.descend(a, b)
      expect(c && c.constructor && c.constructor.name === 'Genotype').toEqual(true)
    })

    it('sets a value close to the parents\' average', () => {
      const a = new Genotype()
      const b = new Genotype()
      const c = Genotype.descend(a, b)
      const trait = pickRandom([
        { area: 'body', trait: 'attractiveness' },
        { area: 'body', trait: 'type' },
        ...Personality.getTraitList().map(trait => ({ area: 'personality', trait }))
      ])
      const avg = (a[trait.area][trait.trait] + b[trait.area][trait.trait]) / 2
      const min = avg - 0.1
      const max = avg + 0.1
      const actual = c[trait.area][trait.trait]
      expect(between(actual, min, max)).toEqual(actual)
    })
  })
})
