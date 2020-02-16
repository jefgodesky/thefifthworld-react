/* global describe, it, expect */

import Body  from './body'
import Genotype from './genotype'
import Personality from './personality'

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
})
