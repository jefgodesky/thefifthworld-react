/* global describe, it, expect */

import Personality from './personality'

import { pickRandom } from './utils'
import { allTrue, clone } from '../../shared/utils'

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
      const trait = pickRandom(Personality.getTraitList())
      expect(p.chance(trait)).toBeGreaterThanOrEqual(0)
    })

    it('returns something less than 100 for a valid trait', () => {
      const p = new Personality()
      const trait = pickRandom(Personality.getTraitList())
      expect(p.chance(trait)).toBeLessThanOrEqual(100)
    })
  })

  describe('check', () => {
    it('returns a boolean', () => {
      const p = new Personality()
      const trait = pickRandom(Personality.getTraitList())
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

    it('is less likely when you have to roll multiple times', () => {
      const p = new Personality({ openness: 0 })
      let yes = 0
      let no = 0
      for (let i = 0; i < 100; i++) {
        if (p.check('openness', 2)) { yes++ } else { no++ }
      }
      expect(no).toBeGreaterThan(yes)
    })

    it('is less likely when you can roll multiple times', () => {
      const p = new Personality({ openness: 0 })
      let yes = 0
      let no = 0
      for (let i = 0; i < 100; i++) {
        if (p.check('openness', 2, 'or')) { yes++ } else { no++ }
      }
      expect(yes).toBeGreaterThan(no)
    })
  })

  describe('change', () => {
    it('changes a trait', () => {
      const traits = Personality.getTraitList()
      const starter = {}
      traits.forEach(trait => { starter[trait] = 0 })
      const p = new Personality(starter)
      p.change()
      const claims = []
      traits.forEach(trait => { claims.push(p[trait] === 0.1 || p[trait] === -0.1) })
      const trueClaims = claims.filter(c => c === true)
      expect(trueClaims.length).toEqual(1)
    })
  })

  describe('addDisorder', () => {
    it('adds the disorder given', () => {
      const p = new Personality()
      p.addDisorder('test')
      expect(p.disorders).toContain('test')
    })

    it('doesn\'t duplicate disorders', () => {
      const p = new Personality()
      p.addDisorder('test')
      p.addDisorder('test')
      const filtered = p.disorders.filter(d => d === 'test')
      expect(filtered).toHaveLength(1)
    })
  })

  describe('removeDisorder', () => {
    it('removes the disorder given', () => {
      const p = new Personality()
      p.disorders = [ 'test' ]
      p.removeDisorder('test')
      expect(p.disorders).not.toContain('test')
    })

    it('does nothing if you don\'t have that disorder', () => {
      const p = new Personality()
      p.disorders = [ 'something else' ]
      p.removeDisorder('test')
      expect(p.disorders).toEqual([ 'something else' ])
    })
  })

  describe('diagnoseExcessiveOpenness', () => {
    it('diagnoses schizophrenia if a person is very open to new experience', () => {
      const p = new Personality({ openness: 3 })
      p.diagnoseExcessiveOpenness()
      expect(p.disorders).toContain('schizophrenia')
    })

    it('does not diagnose schizophrenia if a person is not very open to new experience', () => {
      const p = new Personality({ openness: 0 })
      p.disorders = undefined
      p.diagnoseExcessiveOpenness()
      expect(p.disorders).toEqual(undefined)
    })

    it('removes a diagnosis of schizophrenia if she\'s gotten better', () => {
      const p = new Personality({ openness: 3 })
      p.diagnoseExcessiveOpenness()
      p.openness = 2
      p.diagnoseExcessiveOpenness()
      expect(p.disorders).not.toContain('schizophrenia')
    })
  })

  describe('diagnoseExcessiveConscientiousness', () => {
    it('diagnoses obsessive-compulsive disorder if a person is very conscientiousness', () => {
      const p = new Personality({ conscientiousness: 3 })
      p.diagnoseExcessiveConscientiousness()
      expect(p.disorders).toContain('obsessive-compulsive')
    })

    it('does not diagnose obsessive-compulsive disorder if a person is not very conscientiousness', () => {
      const p = new Personality({ conscientiousness: 0 })
      p.disorders = undefined
      p.diagnoseExcessiveConscientiousness()
      expect(p.disorders).toEqual(undefined)
    })

    it('removes a diagnosis of obsessive-compulsive disorder if she\'s gotten better', () => {
      const p = new Personality({ conscientiousness: 3 })
      p.diagnoseExcessiveConscientiousness()
      p.conscientiousness = 2
      p.diagnoseExcessiveConscientiousness()
      expect(p.disorders).not.toContain('obsessive-compulsive')
    })
  })

  describe('diagnoseDeficientConscientiousness', () => {
    it('diagnoses impulse control if a person is very unconscientiousness', () => {
      const p = new Personality({ conscientiousness: -3 })
      p.diagnoseDeficientConscientiousness()
      expect(p.disorders).toContain('impulse control')
    })

    it('does not diagnose impulse control if a person is not very unconscientiousness', () => {
      const p = new Personality({ conscientiousness: 0 })
      p.disorders = undefined
      p.diagnoseDeficientConscientiousness()
      expect(p.disorders).toEqual(undefined)
    })

    it('removes a diagnosis of impulse control if she\'s gotten better', () => {
      const p = new Personality({ conscientiousness: -3 })
      p.diagnoseDeficientConscientiousness()
      p.conscientiousness = -2
      p.diagnoseDeficientConscientiousness()
      expect(p.disorders).not.toContain('impulse control')
    })
  })

  describe('diagnoseDeficientExtraversion', () => {
    it('diagnoses schizoid disorder if a person is very introverted', () => {
      const p = new Personality({ extraversion: -3 })
      p.diagnoseDeficientExtraversion()
      expect(p.disorders).toContain('schizoid')
    })

    it('does not diagnose schizoid disorder if a person is not very introverted', () => {
      const p = new Personality({ extraversion: 0 })
      p.disorders = undefined
      p.diagnoseDeficientExtraversion()
      expect(p.disorders).toEqual(undefined)
    })

    it('removes a diagnosis of schizoid disorder if she\'s gotten better', () => {
      const p = new Personality({ extraversion: -3 })
      p.diagnoseDeficientExtraversion()
      p.extraversion = -2
      p.diagnoseDeficientExtraversion()
      expect(p.disorders).not.toContain('schizoid')
    })
  })

  describe('diagnoseDeficientAgreeablenness', () => {
    it('diagnoses antisocial disorder if a person is very disagreeable', () => {
      const p = new Personality({ agreeableness: -3 })
      p.diagnoseDeficientAgreeableness()
      expect(p.disorders).toContain('antisocial')
    })

    it('does not diagnose antisocial disorder if a person is not very disagreeable', () => {
      const p = new Personality({ agreeableness: 0 })
      p.disorders = undefined
      p.diagnoseDeficientAgreeableness()
      expect(p.disorders).toEqual(undefined)
    })

    it('removes a diagnosis of antisocial disorder if she\'s gotten better', () => {
      const p = new Personality({ agreeableness: -3 })
      p.diagnoseDeficientAgreeableness()
      p.agreeableness = -2
      p.diagnoseDeficientAgreeableness()
      expect(p.disorders).not.toContain('antisocial')
    })
  })

  describe('diagnoseExcessiveNeuroticism', () => {
    it('adds several possible disorders if you are excessively neurotic', () => {
      const p = new Personality({ neuroticism: 2.5 })
      p.disorders = []
      p.diagnoseExcessiveNeuroticism()
      expect(p.disorders).toHaveLength(2)
    })

    it('does not diagnose any disorders if a person is not very neurotic', () => {
      const p = new Personality({ neuroticism: 0 })
      p.disorders = undefined
      p.diagnoseExcessiveNeuroticism()
      expect(p.disorders).toEqual(undefined)
    })

    it('does not change which disorders were diagnosed when it\'s run again', () => {
      const p = new Personality({ neuroticism: 2.5 })
      p.disorders = []
      p.diagnoseExcessiveNeuroticism()
      const before = clone(p.disorders)
      p.diagnoseExcessiveNeuroticism()
      expect(p.disorders).toEqual(before)
    })

    it('removes disorders if she\'s gotten better', () => {
      const p = new Personality({ neuroticism: 3 })
      p.diagnoseExcessiveNeuroticism()
      const before = p.disorders.length
      p.neuroticism = 2.5
      p.diagnoseExcessiveNeuroticism()
      expect(p.disorders.length).toBeLessThan(before)
    })
  })

  describe('diagnoseAutism', () => {
    it('diagnoses autism if neuroticism is very high and all others are very low', () => {
      const p = new Personality({
        openness: -2,
        conscientiousness: -2,
        extraversion: -2,
        agreeableness: -2,
        neuroticism: 2
      })
      p.diagnoseAutism()
      expect(p.disorders).toContain('autism')
    })

    it('removes autism diagnosis if any trait moves towards the mean', () => {
      const p = new Personality({
        openness: -2,
        conscientiousness: -2,
        extraversion: -2,
        agreeableness: -2,
        neuroticism: 2
      })
      p.diagnoseAutism()
      const trait = pickRandom(Personality.getTraitList())
      p[trait] = 0
      p.diagnoseAutism()
      expect(p.disorders).not.toContain('autism')
    })
  })

  describe('getDisorders', () => {
    it('reports schizophrenia if you are excessively open', () => {
      const p = new Personality({
        openness: 2.1,
        conscientiousness: 0,
        extraversion: 0,
        agreeableness: 0,
        neuroticism: 0
      })
      expect(p.getDisorders()).toEqual([ 'schizophrenia' ])
    })

    it('reports obsessive-compulsive disorder if you are excessively conscientious', () => {
      const p = new Personality({
        openness: 0,
        conscientiousness: 2.1,
        extraversion: 0,
        agreeableness: 0,
        neuroticism: 0
      })
      expect(p.getDisorders()).toEqual([ 'obsessive-compulsive' ])
    })

    it('reports impulse control if your conscientiousness is very low', () => {
      const p = new Personality({
        openness: 0,
        conscientiousness: -2.1,
        extraversion: 0,
        agreeableness: 0,
        neuroticism: 0
      })
      expect(p.getDisorders()).toEqual([ 'impulse control' ])
    })

    it('reports schizoid personality disorder if you are extremely introverted', () => {
      const p = new Personality({
        openness: 0,
        conscientiousness: 0,
        extraversion: -2.1,
        agreeableness: 0,
        neuroticism: 0
      })
      expect(p.getDisorders()).toEqual([ 'schizoid' ])
    })

    it('reports antisocial personality disorder if you are extremely disagreeable', () => {
      const p = new Personality({
        openness: 0,
        conscientiousness: 0,
        extraversion: 0,
        agreeableness: -2.1,
        neuroticism: 0
      })
      expect(p.getDisorders()).toEqual([ 'antisocial' ])
    })

    it('reports several possible disorders if you are extremely neurotic', () => {
      const p = new Personality({
        openness: 0,
        conscientiousness: 0,
        extraversion: 0,
        agreeableness: 0,
        neuroticism: 2.1
      })
      expect(p.getDisorders()).toEqual([ 'depression|anxiety|bipolar|borderline|histrionic' ])
    })

    it('reports autism if you\'re low in the first four and high in neuroticism', () => {
      const p = new Personality({
        openness: -1,
        conscientiousness: -1,
        extraversion: -1,
        agreeableness: -1,
        neuroticism: 1
      })
      expect(p.getDisorders()).toEqual([ 'autism' ])
    })

    it('can report multiple disorders', () => {
      const p = new Personality({
        openness: 2.1,
        conscientiousness: 0,
        extraversion: 0,
        agreeableness: -2.1,
        neuroticism: 0
      })
      expect(p.getDisorders()).toEqual([ 'schizophrenia', 'antisocial' ])
    })
  })

  describe('getTraitList', () => {
    it('returns an array of the Big Five personality traits', () => {
      const expected = [ 'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism' ]
      expect(Personality.getTraitList()).toEqual(expected)
    })
  })

  describe('copy', () => {
    it('copies trait values', () => {
      const p1 = new Personality()
      const p2 = Personality.copy(p1)
      const traits = Personality.getTraitList()
      const tests = []
      traits.forEach(trait => { tests.push(p1[trait] === p2[trait]) })
      expect(allTrue(tests)).toEqual(true)
    })

    it('returns a Personality object', () => {
      const p1 = new Personality()
      const p2 = Personality.copy(p1)
      expect(p2.constructor.name).toEqual('Personality')
    })

    it('creates a deep copy', () => {
      const p1 = new Personality({ openness: 0 })
      const p2 = Personality.copy(p1)
      p1.openness = 1
      expect(p2.openness).toEqual(0)
    })
  })
})
