/* global describe, it, expect */

import Community from './community'
import Person from './person'

describe('Person', () => {
  describe('constructor', () => {
    it('creates a genotype', () => {
      const p = new Person()
      expect(p.genotype.constructor.name).toEqual('Body')
    })

    it('creates a body', () => {
      const p = new Person()
      expect(p.body.constructor.name).toEqual('Body')
    })

    it('creates a personality', () => {
      const p = new Person()
      expect(p.personality.constructor.name).toEqual('Personality')
    })

    it('creates a sexuality', () => {
      const p = new Person()
      expect(p.sexuality.constructor.name).toEqual('Sexuality')
    })

    it('assigns a gender', () => {
      const genders = [
        'Feminine woman', 'Woman', 'Masculine woman',
        'Third gender', 'Fifth gender',
        'Feminine man', 'Man', 'Masculine man'
      ]
      const p = new Person()
      expect(genders.includes(p.gender))
    })

    it('assigns intelligence', () => {
      const p = new Person()
      expect(typeof p.intelligence).toEqual('number')
    })

    it('determines neurodivergence', () => {
      const p = new Person()
      expect(typeof p.neurodivergent).toEqual('boolean')
    })
  })

  describe('assignGender', () => {
    it('assigns a gender', () => {
      const genders = [ 'Woman', 'Third gender', 'Man' ]
      const p = new Person()
      p.gender = null
      p.assignGender()
      expect(genders.includes(p.gender))
    })

    it('assigns a gender in a four-gender system', () => {
      const genders = [
        'Feminine woman', 'Woman', 'Masculine woman',
        'Feminine man', 'Man', 'Masculine man'
      ]
      const p = new Person()
      p.gender = null
      p.assignGender(4)
      expect(genders.includes(p.gender))
    })

    it('assigns a gender in a five-gender system', () => {
      const genders = [
        'Feminine woman', 'Woman', 'Masculine woman', 'Fifth gender',
        'Feminine man', 'Man', 'Masculine man'
      ]
      const p = new Person()
      p.gender = null
      p.assignGender(4)
      expect(genders.includes(p.gender))
    })

    it('assigns a gender in a two-gender system', () => {
      const genders = [ 'Man', 'Woman' ]
      const p = new Person()
      p.gender = null
      p.assignGender(2)
      expect(genders.includes(p.gender))
    })
  })

  describe('wantsMate', () => {
    it('returns a boolean', () => {
      const p = new Person({ born: 1979 })
      expect(typeof p.wantsMate(2019)).toEqual('boolean')
    })

    it('always returns false for a child', () => {
      const p = new Person({ born: 1979 })
      let affirmatives = 0
      for (let i = 0; i < 100; i++) {
        if (p.wantsMate(1994)) affirmatives++
      }
      expect(affirmatives).toEqual(0)
    })

    it('returns true more often for someone in her 20s', () => {
      const younger = new Person({ born: 1995 })
      const elder = new Person({ born: 1965 })

      younger.sexuality.androphilia = 1
      younger.sexuality.gynephilia = 0
      younger.sexuality.skoliophilia = 0
      younger.body.fertility = 100

      elder.sexuality.androphilia = 1
      elder.sexuality.gynephilia = 0
      elder.sexuality.skoliophilia = 0
      elder.body.fertility = 0

      const counter = {
        younger: { affirmatives: 0, negatives: 0 },
        elder: { affirmatives: 0, negatives: 0 }
      }

      for (let i = 0; i < 100; i++) {
        const youngerResult = younger.wantsMate(2020)
        const elderResult = elder.wantsMate(2020)
        if (youngerResult) { counter.younger.affirmatives++ } else { counter.younger.negatives++ }
        if (elderResult) { counter.elder.affirmatives++ } else { counter.elder.negatives++ }
      }

      const actual = [
        counter.younger.affirmatives + counter.younger.negatives === 100,
        counter.elder.affirmatives + counter.elder.negatives === 100,
        counter.younger.affirmatives > counter.elder.affirmatives
      ].reduce((acc, curr) => acc && curr, true)
      expect(actual).toEqual(true)
    })
  })

  describe('die', () => {
    it('marks the character as dead', () => {
      const p = new Person()
      p.die()
      expect(p.died)
    })

    it('records the year the person died', () => {
      const p = new Person()
      p.die('natural', 2019)
      expect(p.died).toEqual(2019)
    })

    it('records an entry for the person\'s death', () => {
      const p = new Person()
      p.die()
      expect(p.history.length).toEqual(1)
    })

    it('tags the entry for the person\'s death', () => {
      const p = new Person()
      p.die()
      const arr = p.history.filter(e => e.event === 'died')
      expect(arr.length).toEqual(1)
    })

    it('records the cause of death', () => {
      const p = new Person()
      const cause = 'chocolate'
      p.die(cause)
      expect(p.history[0].cause).toEqual(cause)
    })
  })

  describe('age', () => {
    it('won\'t let you live more than 10 years beyond your longevity', () => {
      const p = new Person({ born: 1908 })
      const c = new Community()
      p.body.longevity = 100
      p.age(c, 2019)
      expect(p.died)
    })
  })
})
