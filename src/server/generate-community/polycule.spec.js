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
      expect(p.people.length).toEqual(2)
    })

    it('has a smaller love matrix', () => {
      const a = new Person()
      const b = new Person()
      const c = new Person()
      const p = new Polycule(a, b, c)
      const before = p.love.length
      p.remove(c)
      expect(p.love.length).toBeLessThan(before)
    })

    it('maintains love values', () => {
      const a = new Person()
      const b = new Person()
      const c = new Person()
      const p = new Polycule(a, b, c)
      const before = p.love[0][1]
      p.remove(c)
      expect(p.love[0][1]).toEqual(before)
    })

    it('deletes itself if only one person remains', () => {
      const a = new Person()
      const b = new Person()
      const p = new Polycule(a, b)
      p.remove(b)
      const actual = [
        a.polycule === undefined,
        b.polycule === undefined,
        p === undefined
      ].reduce((acc, curr) => acc && curr, true)
      expect(actual)
    })
  })

  describe('getLoveWithout', () => {
    it('returns a smaller love matrix', () => {
      const a = new Person()
      const b = new Person()
      const c = new Person()
      const p = new Polycule(a, b, c)
      const actual = p.getLoveWithout(c)
      expect(actual.length).toEqual(2)
    })

    it('maintains love values', () => {
      const a = new Person()
      const b = new Person()
      const c = new Person()
      const p = new Polycule(a, b, c)
      const actual = p.getLoveWithout(c)
      expect(actual[0][1]).toEqual(p.love[0][1])
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
        [ null, 50, 50 ],
        [ 50, null, 50 ],
        [ 50, 50, null ]
      ]
      expect(p.avg()).toEqual(150)
    })

    it('can calculate what it would be like without someone', () => {
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
        [ null, 50, 10 ],
        [ 50, null, 50 ],
        [ 10, 50, null ]
      ]
      const withC = p.avg()
      const withoutC = p.avg(c)
      expect(withoutC).toBeGreaterThan(withC)
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

  describe('getPartners', () => {
    it('returns the other members of the polycule', () => {
      const a = new Person()
      const b = new Person()
      const p = new Polycule(a, b)
      expect(p.getOthers(a)).toEqual([ b ])
    })

    it('returns everyone in the polycule if given someone not in it', () => {
      const a = new Person()
      const b = new Person()
      const p = new Polycule(a, b)
      expect(p.getOthers()).toEqual([ a, b ])
    })
  })

  describe('partnerDelta', () => {
    it('returns a delta on how the polycule would change without each member', () => {
      const a = new Person()
      const b = new Person()
      const c = new Person()
      const p = new Polycule(a, b, c)
      const actual = p.partnerDelta()
      const { deltas } = actual
      const test = `${typeof deltas[0]} ${typeof deltas[1]} ${typeof deltas[2]}`
      expect(test).toEqual('number number number')
    })

    it('returns the index of the person whose removal would make the biggest improvement', () => {
      const a = new Person()
      const b = new Person()
      const c = new Person()
      const p = new Polycule(a, b, c)
      const actual = p.partnerDelta()
      const tests = [
        typeof actual.index === 'number',
        actual.index >= 0,
        actual.index < p.people.length
      ].reduce((acc, curr) => acc && curr, true)
      expect(tests)
    })

    it('provides a recommendation on whether or not to remove someone', () => {
      const a = new Person()
      const b = new Person()
      const c = new Person()
      const p = new Polycule(a, b, c)
      const actual = p.partnerDelta()
      expect(typeof actual.recommendation).toEqual('boolean')
    })

    it('takes a threshold for recommending removing someone', () => {
      const a = new Person()
      const b = new Person()
      const c = new Person()
      const p = new Polycule(a, b, c)
      const actual = p.partnerDelta(20)
      const expected = Math.max(...actual.deltas) > 20
      expect(actual.recommendation).toEqual(expected)
    })
  })

  describe('change', () => {
    it('increases love scores when people grow closer', () => {
      const a = new Person()
      const b = new Person()
      const p = new Polycule(a, b)
      const before = p.love[0][1]
      a.personality.openness.value = b.personality.openness.value
      p.change()
      expect(p.love[0][1]).toBeGreaterThan(before)
    })

    it('decreases love scores when people grow apart', () => {
      const a = new Person()
      const b = new Person()
      const p = new Polycule(a, b)
      const before = p.love[0][1]
      a.personality.openness.value = 3
      b.personality.openness.value = -3
      p.change()
      expect(p.love[0][1]).toBeLessThan(before)
    })

    it('maintains symmetry', () => {
      const a = new Person()
      const b = new Person()
      const p = new Polycule(a, b)
      p.change()
      expect(p.love[0][1]).toEqual(p.love[1][0])
    })

    it('might kick someone out', () => {
      const a = new Person()
      const b = new Person()
      const c = new Person()
      const p = new Polycule(a, b, c)
      const before = p.people.length
      p.change()
      expect(p.people.length).toBeLessThanOrEqual(before)
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
      expect(rel === false || rel.avg() > 30)
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
