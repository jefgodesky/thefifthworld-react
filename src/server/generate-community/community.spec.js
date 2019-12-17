/* global describe, it, expect */

import Community from './community'
import Person from './person'

describe('Community', () => {
  describe('constructor', () => {
    it('copies data provided', () => {
      const data = { test: { val: 57 } }
      const c = new Community(data)
      expect(c.test.val).toEqual(57)
    })
  })

  describe('init', () => {
    it('prepares the people index', () => {
      const c = new Community()
      expect(c.people).toEqual({})
    })

    it('prepares the chronicle', () => {
      const c = new Community()
      expect(c.chronicle).toEqual([])
    })

    it('sets an initial discord', () => {
      const c = new Community()
      expect(c.status.discord).toBeLessThan(50)
    })
  })

  describe('add', () => {
    it('adds a person to the community', () => {
      const p = new Person()
      const c = new Community()
      c.add(p)
      expect(Object.keys(c.people).length).toEqual(1)
    })

    it('returns the person\'s index', () => {
      const p = new Person()
      const c = new Community()
      const index = c.add(p)
      expect(index).toEqual('0')
    })

    it('assigns the person\'s community ID', () => {
      const p = new Person()
      const c = new Community()
      c.add(p)
      expect(p.id).toEqual('0')
    })
  })

  describe('get', () => {
    it('gets a person from the community', () => {
      const p = new Person()
      const c = new Community()
      c.add(p)
      const actual = c.get('0')
      expect(actual)
    })

    it('returns a Person object', () => {
      const p = new Person()
      const c = new Community()
      c.add(p)
      const actual = c.get('0')
      expect(actual.constructor.name).toEqual('Person')
    })

    it('returns a property', () => {
      const p = new Person()
      const c = new Community()
      c.add(p)
      const actual = c.get('0', 'intelligence')
      expect(typeof actual).toEqual('number')
    })

    it('returns a Body', () => {
      const p = new Person()
      const c = new Community()
      c.add(p)
      const actual = c.get('0', 'body')
      expect(actual.constructor.name).toEqual('Body')
    })

    it('returns a Personality', () => {
      const p = new Person()
      const c = new Community()
      c.add(p)
      const actual = c.get('0', 'personality')
      expect(actual.constructor.name).toEqual('Personality')
    })

    it('returns a Sexuality', () => {
      const p = new Person()
      const c = new Community()
      c.add(p)
      const actual = c.get('0', 'sexuality')
      expect(actual.constructor.name).toEqual('Sexuality')
    })

    it('returns a nested value', () => {
      const p = new Person()
      const c = new Community()
      c.add(p)
      const actual = c.get('0', 'personality.openness.value')
      expect(typeof actual).toEqual('number')
    })
  })

  describe('getCurrentPopulation', () => {
    it('returns the members of the community', () => {
      const c = new Community()
      const p1 = new Person()
      const p2 = new Person()
      const id1 = c.add(p1)
      const id2 = c.add(p2)
      const pop = c.getCurrentPopulation()
      const actual = [
        id1 === pop[0].id,
        id2 === pop[1].id,
        pop.length === 2
      ].reduce((acc, curr) => acc && curr, true)
      expect(actual)
    })

    it('doesn\'t include people who have died', () => {
      const c = new Community()
      const p1 = new Person()
      const p2 = new Person()
      c.add(p1)
      c.add(p2)
      p2.died = true
      const pop = c.getCurrentPopulation()
      expect(pop.length).toEqual(1)
    })

    it('doesn\'t include people who have left', () => {
      const c = new Community()
      const p1 = new Person()
      const p2 = new Person()
      c.add(p1)
      c.add(p2)
      p2.left = true
      const pop = c.getCurrentPopulation()
      expect(pop.length).toEqual(1)
    })
  })
})
