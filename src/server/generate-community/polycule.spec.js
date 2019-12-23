/* global describe, it, expect */

import Community from './community'
import Person from './person'
import Polycule from './polycule'

describe('Polycule', () => {
  describe('constructor', () => {
    it('creates an array of participants', () => {
      const a = new Person()
      const b = new Person()
      const c = new Person()
      const p = new Polycule(a, b, c)
      expect(p.people).toEqual([ a, b, c ])
    })

    it('creates a two-dimensional array of love', () => {
      const a = new Person()
      const b = new Person()
      const c = new Person()
      const p = new Polycule(a, b, c)

      const actual = [
        p.love[0][0] === 1,
        typeof p.love[0][1] === 'number',
        typeof p.love[0][2] === 'number',
        typeof p.love[1][0] === 'number',
        p.love[1][1] === 1,
        typeof p.love[1][2] === 'number',
        typeof p.love[2][0] === 'number',
        typeof p.love[2][1] === 'number',
        p.love[2][2] === 1,
        p.love[0][1] === p.love[1][0],
        p.love[0][2] === p.love[2][0],
        p.love[1][2] === p.love[2][1]
      ].reduce((acc, curr) => acc && curr, true)
      expect(actual)
    })
  })

  describe('add', () => {
    it('adds a new partner to the polycule', () => {
      const a = new Person()
      const b = new Person()
      const c = new Person()
      const p = new Polycule(a, b)
      p.add(c)

      const actual = [
        p.people.length === 3,
        p.love[0][0] === 1,
        typeof p.love[0][1] === 'number',
        typeof p.love[0][2] === 'number',
        typeof p.love[1][0] === 'number',
        p.love[1][1] === 1,
        typeof p.love[1][2] === 'number',
        typeof p.love[2][0] === 'number',
        typeof p.love[2][1] === 'number',
        p.love[2][2] === 1,
        p.love[0][1] === p.love[1][0],
        p.love[0][2] === p.love[2][0],
        p.love[1][2] === p.love[2][1]
      ].reduce((acc, curr) => acc && curr, true)
      expect(actual)
    })
  })

  describe('remove', () => {
    it('removes a new partner from the polycule', () => {
      const a = new Person()
      const b = new Person()
      const c = new Person()
      const p = new Polycule(a, b, c)
      p.remove(c)

      const actual = [
        p.people.length === 2,
        p.love[0][0] === 1,
        typeof p.love[0][1] === 'number',
        typeof p.love[0][2] === undefined,
        typeof p.love[1][0] === 'number',
        p.love[1][1] === 1,
        typeof p.love[1][2] === undefined,
        typeof p.love[2] === undefined,
        p.love[0][1] === p.love[1][0]
      ].reduce((acc, curr) => acc && curr, true)
      expect(actual)
    })
  })

  describe('avg', () => {
    it('returns an average', () => {
      const a = new Person()
      const b = new Person()
      const c = new Person()
      a.personality.openness.value = 0; b.personality.openness.value = 0; c.personality.openness.value = 0
      a.personality.conscientiousness.value = 0; b.personality.conscientiousness.value = 0; c.personality.conscientiousness.value = 0
      a.personality.extraversion.value = 0; b.personality.extraversion.value = 0; c.personality.extraversion.value = 0
      a.personality.agreeableness.value = 0; b.personality.agreeableness.value = 0; c.personality.agreeableness.value = 0
      a.personality.neuroticism.value = 0; b.personality.neuroticism.value = 0; c.personality.neuroticism.value = 0
      const p = new Polycule(a, b, c)
      p.love = [
        [ 1, 0.5, 0.5 ],
        [ 0.5, 1, 0.5 ],
        [ 0.5, 0.5, 1 ]
      ]
      expect(p.avg()).toEqual(0.5)
    })
  })

  describe('commit', () => {
    it('saves the polycule to each member', () => {
      const a = new Person()
      const b = new Person()
      const c = new Person()
      const p = new Polycule(a, b)
      p.commit()
      const actual = [
        a.polycule.constructor.name === 'Polycule',
        b.polycule.constructor.name === 'Polycule',
        c.polycule === undefined
      ].reduce((acc, curr) => acc && curr, true)
      expect(actual)
    })
  })

  describe('form', () => {
    it('can form a new polycule', () => {
      const c = new Community()
      const p = new Person()
      p.body.born = 1979
      p.sexuality.androphilia = 1
      p.sexuality.gynephilia = 1
      p.sexuality.skoliophilia = 1
      let successes = 0
      for (let i = 0; i < 10; i++) {
        const poly = Polycule.form(p, c, 2019)
        if (poly) successes++
      }
      expect(successes).toBeGreaterThanOrEqual(0)
    })

    it('won\'t return a relationship of insufficient qualtiy', () => {
      const c = new Community()
      const p = new Person()
      p.body.born = 1979
      p.sexuality.androphilia = 1
      p.sexuality.gynephilia = 1
      p.sexuality.skoliophilia = 1
      const rel = Polycule.form(p, c, 2019)
      expect(rel === false || rel.avg() > 0.4)
    })

    it('saves the polycule to each of the partners', () => {
      const c = new Community()
      const p = new Person()
      p.body.born = 1979
      p.sexuality.androphilia = 1
      p.sexuality.gynephilia = 1
      p.sexuality.skoliophilia = 1
      const rel = Polycule.form(p, c, 2019)
      const actual = rel === false
        ? [ true ]
        : [
          rel.people[0].polycule === rel,
          rel.people[1].polycule === rel
        ]
      expect(actual.reduce((acc, curr) => acc && curr, true))
    })
  })
})
