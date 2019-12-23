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

    it('prepares history', () => {
      const c = new Community()
      expect(c.history).toEqual([])
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

    it('assigns the person\'s community', () => {
      const p = new Person()
      const c = new Community()
      c.add(p)
      expect(p.community === c)
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

  describe('getMasters', () => {
    it('gets an array of the people who have mastered a given skill', () => {
      const skill = 'Acting'
      const c = new Community()

      const p1 = new Person()
      p1.skills.mastered = [ skill ]
      c.add(p1)

      const p2 = new Person()
      p2.skills.mastered = [ skill ]
      c.add(p2)

      const p3 = new Person()
      c.add(p3)

      const p4 = new Person()
      c.add(p4)

      const everyone = c.getCurrentPopulation()
      const actors = c.getMasters(skill)

      expect(everyone.length === 4 && actors.length === 2)
    })
  })

  describe('getRecentHistory', () => {
    it('returns 5 years by default', () => {
      const c = new Community()
      c.history = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
      expect(c.getRecentHistory().length).toEqual(5)
    })

    it('returns the number of entries requested', () => {
      const c = new Community()
      c.history = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
      expect(c.getRecentHistory(8).length).toEqual(8)
    })

    it('returns no more than the number of entries in the history', () => {
      const c = new Community()
      c.history = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
      expect(c.getRecentHistory(25).length).toEqual(11)
    })
  })

  describe('calculateHelp', () => {
    it('can help with a skill', () => {
      const c = new Community()
      const h = new Person()
      h.skills.mastered = [ 'Medicine' ]
      c.add(h)
      expect(c.calculateHelp('Medicine', 25)).toEqual(25)
    })

    it('suffers from diminishing marginal returns', () => {
      const c = new Community()
      const h1 = new Person()
      h1.skills.mastered = [ 'Medicine' ]
      c.add(h1)
      const h2 = new Person()
      h2.skills.mastered = [ 'Medicine' ]
      c.add(h2)
      const h3 = new Person()
      h3.skills.mastered = [ 'Medicine' ]
      c.add(h3)
      expect(c.calculateHelp('Medicine', 25)).toEqual(57.8125)
    })
  })

  describe('hasProblems', () => {
    it('returns true if the community has problems', () => {
      const c = new Community()
      c.status.conflict = true
      expect(c.hasProblems()).toEqual(true)
    })

    it('returns false if the community has no problems', () => {
      const c = new Community()
      c.status.lean = false
      c.status.sick = false
      c.status.conflict = false
      expect(c.hasProblems()).toEqual(false)
    })
  })

  describe('adjustYield', () => {
    it('adds 30', () => {
      const c = new Community()
      c.adjustYield()
      expect(c.territory.yield).toEqual(30)
    })

    it('adds 150 if you\'re a village', () => {
      const c = new Community()
      c.traditions = { village: true }
      c.adjustYield()
      expect(c.territory.yield).toEqual(150)
    })

    it('subtracts population', () => {
      const c = new Community()
      for (let i = 0; i < 20; i++) {
        const p = new Person()
        c.add(p)
      }
      c.adjustYield()
      expect(c.territory.yield).toEqual(10)
    })

    it('can go negative', () => {
      const c = new Community()
      for (let i = 0; i < 40; i++) {
        const p = new Person()
        c.add(p)
      }
      c.adjustYield()
      expect(c.territory.yield).toEqual(-10)
    })

    it('accumulates', () => {
      const c = new Community()
      c.adjustYield() // +30 since no one is here
      for (let i = 0; i < 40; i++) {
        const p = new Person()
        c.add(p)
      }
      c.adjustYield() // -10 because we're 10 over carrying capacity
      expect(c.territory.yield).toEqual(20)
    })
  })

  describe('newProblems', () => {
    it('will not add lean times if yield is positive', () => {
      const c = new Community()
      c.territory.yield = 10
      c.newProblems()
      expect(c.status.lean).not.toEqual(true)
    })

    it('will not add lean times if yield is zero', () => {
      const c = new Community()
      c.territory.yield = 0
      c.newProblems()
      expect(c.status.lean).not.toEqual(true)
    })

    it('will add lean times if yield is negative', () => {
      const c = new Community()
      c.territory.yield = -10
      c.newProblems()
      expect(c.status.lean)
    })

    it('will add sickness more often in lean times', () => {
      let control = 0
      let test = 0

      // First the control sample
      for (let i = 0; i < 100; i++) {
        const c = new Community()
        c.territory.yield = 10
        c.newProblems()
        if (c.status.sick) control++
      }

      // Then the test sample
      for (let i = 0; i < 100; i++) {
        const c = new Community()
        c.territory.yield = -10
        c.newProblems()
        if (c.status.sick) test++
      }

      expect(test).toBeGreaterThanOrEqual(control)
    })

    it('will add sickness more often when you have a lot of people', () => {
      let control = 0
      let test = 0

      // First the control sample
      for (let i = 0; i < 100; i++) {
        const c = new Community()
        c.newProblems()
        if (c.status.sick) control++
      }

      // Then the test sample
      for (let i = 0; i < 100; i++) {
        const c = new Community()
        for (let j = 0; j < 45; j++) c.add(new Person())
        c.newProblems()
        if (c.status.sick) test++
      }

      expect(test).toBeGreaterThanOrEqual(control)
    })

    it('will add conflict more often in lean times', () => {
      let control = 0
      let test = 0

      // First the control sample
      for (let i = 0; i < 100; i++) {
        const c = new Community()
        c.territory.yield = 10
        c.newProblems()
        if (c.status.conflict) control++
      }

      // Then the test sample
      for (let i = 0; i < 100; i++) {
        const c = new Community()
        c.territory.yield = -10
        c.newProblems()
        if (c.status.conflict) test++
      }

      expect(test).toBeGreaterThanOrEqual(control)
    })
  })

  describe('solveProblems', () => {
    it('removes lean times if yield is above zero', () => {
      const c = new Community()
      c.status.lean = true
      c.territory.yield = 10
      c.solveProblems()
      expect(c.status.lean).toEqual(false)
    })

    it('removes lean times if yield equals zero', () => {
      const c = new Community()
      c.status.lean = true
      c.territory.yield = 10
      c.solveProblems()
      expect(c.status.lean).toEqual(false)
    })

    it('is more likely to end sickness if the community has more healers', () => {
      let control = 0
      let test = 0
      const c = new Community()

      // Control group
      for (let i = 0; i < 100; i++) {
        c.status.sick = true
        c.solveProblems()
        if (!c.status.sick) control++
      }

      // Test group
      const h1 = new Person(); h1.skills.mastered = [ 'Medicine' ]; c.add(h1)
      const h2 = new Person(); h2.skills.mastered = [ 'Medicine' ]; c.add(h2)
      const h3 = new Person(); h3.skills.mastered = [ 'Medicine' ]; c.add(h3)
      for (let i = 0; i < 100; i++) {
        c.status.sick = true
        c.solveProblems()
        if (!c.status.sick) test++
      }

      expect(test).toBeGreaterThanOrEqual(control)
    })

    it('is more likely to end conflict if the community has more peacemakers', () => {
      let control = 0
      let test = 0
      const c = new Community()

      // Control group
      for (let i = 0; i < 100; i++) {
        c.status.conflict = true
        c.solveProblems()
        if (!c.status.conflict) control++
      }

      // Test group
      const p1 = new Person(); p1.skills.mastered = [ 'Deescalation' ]; c.add(p1)
      const p2 = new Person(); p2.skills.mastered = [ 'Deescalation' ]; c.add(p2)
      const p3 = new Person(); p3.skills.mastered = [ 'Deescalation' ]; c.add(p3)
      for (let i = 0; i < 100; i++) {
        c.status.conflict = true
        c.solveProblems()
        if (!c.status.conflict) test++
      }

      expect(test).toBeGreaterThanOrEqual(control)
    })
  })
})
