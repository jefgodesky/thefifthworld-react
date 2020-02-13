/* global describe, it, expect */

import random from 'random'
import Community from './community'
import Person from './person'
import Polycule from './polycule'
import { allTrue, isPopulatedArray } from '../../shared/utils'

describe('Community', () => {
  describe('constructor', () => {
    it('copies data provided', () => {
      const data = { test: { val: 57 } }
      const c = new Community(data)
      expect(c.test.val).toEqual(57)
    })
  })

  describe('init', () => {
    it('prepares the people array', () => {
      const c = new Community()
      expect(c.people).toEqual([])
    })

    it('prepares the polycules array', () => {
      const c = new Community()
      expect(c.polycules).toEqual([])
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
      expect(c.people.length).toEqual(1)
    })

    it('assigns the person\'s community', () => {
      const p = new Person()
      const c = new Community()
      c.add(p)
      expect(p.community === c)
    })
  })

  describe('addPolycule', () => {
    it('adds a polycule', () => {
      const a = new Person()
      const b = new Person()
      const p = new Polycule([ a, b ])
      const c = new Community()
      c.addPolycule(p)
      expect(c.polycules.length).toEqual(1)
    })
  })

  describe('removePolycule', () => {
    it('removes a polycule', () => {
      const a = new Person()
      const b = new Person()
      const p = new Polycule([ a, b ])
      const c = new Community()
      c.addPolycule(p)
      c.removePolycule(p)
      expect(c.polycules.length).toEqual(0)
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
      ]
      expect(allTrue(actual)).toEqual(true)
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
      for (let i = 0; i < 10; i++) c.recordHistory(i)
      c.present = 9
      expect(c.getRecentHistory().length).toEqual(5)
    })

    it('returns the number of entries requested', () => {
      const c = new Community()
      for (let i = 0; i < 10; i++) c.recordHistory(i)
      c.present = 9
      expect(c.getRecentHistory(8).length).toEqual(8)
    })

    it('returns no more than the number of entries in the history', () => {
      const c = new Community()
      for (let i = 0; i < 10; i++) c.recordHistory(i)
      c.present = 9
      expect(c.getRecentHistory(20).length).toEqual(10)
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

  describe('generateStrangers', () => {
    it('returns at least 5 strangers', () => {
      const c = new Community()
      c.present = 2020
      const actual = c.generateStrangers()
      expect(actual.length).toBeGreaterThanOrEqual(5)
    })

    it('returns at most 10 strangers', () => {
      const c = new Community()
      c.present = 2020
      const actual = c.generateStrangers()
      expect(actual.length).toBeLessThanOrEqual(10)
    })

    it('returns a number of strangers at least as large as 1/8 of the community\'s population', () => {
      const c = new Community()
      c.present = 2020
      for (let i = 0; i < 120; i++) { const p = new Person(); c.add(p) }
      const actual = c.generateStrangers()
      expect(actual.length).toBeGreaterThanOrEqual(15)
    })

    it('returns a number of strangers at most as large as 1/4 of the community\'s population', () => {
      const c = new Community()
      c.present = 2020
      for (let i = 0; i < 120; i++) { const p = new Person(); c.add(p) }
      const actual = c.generateStrangers()
      expect(actual.length).toBeLessThanOrEqual(30)
    })

    it('returns strangers that are at least 16 years old', () => {
      const c = new Community()
      c.present = 2020
      const ages = c.generateStrangers().map(p => p.getAge())
      expect(Math.min(...ages)).toBeGreaterThanOrEqual(16)
    })

    it('returns strangers that are at most 65 years old', () => {
      const c = new Community()
      c.present = 2020
      const ages = c.generateStrangers().map(p => p.getAge())
      expect(Math.max(...ages)).toBeLessThanOrEqual(66)
    })
  })

  describe('judgeMurder', () => {
    it('might exile a murderer', () => {
      const c = new Community()
      const murderer = new Person()
      c.add(murderer)
      const victim = new Person()
      murderer.murder([ victim ])
      c.judgeMurder({
        murderer,
        victims: [ victim ],
        attempted: [],
        outcome: 'murder'
      })
      const today = new Date()
      const record = murderer.history.get({ year: today.getFullYear(), tags: [ 'left' ] })
      const entry = isPopulatedArray(record) ? record[0] : false
      const exiled = entry && entry.tags.includes('exile') && entry.crime === 'murder'
      expect(exiled || !entry).toEqual(true)
    })

    it('might execute a murderer who\'s killed before', () => {
      const c = new Community()
      const murderer = new Person()
      c.add(murderer)
      const oldVictim = new Person()
      const newVictim = new Person()
      murderer.murder([ oldVictim ])
      murderer.murder([ newVictim ])
      c.judgeMurder({
        murderer,
        victims: [ newVictim ],
        attempted: [],
        outcome: 'murder'
      })
      const today = new Date()
      const record = murderer.history.get({ year: today.getFullYear(), tags: [ 'exile', 'died' ] })
      const entry = isPopulatedArray(record) ? record[0] : {}
      const executed = Boolean(entry.tags) && entry.tags.includes('died') && entry.cause === 'executed'
      const exiled = Boolean(entry.tags) && entry.tags.includes('left') && entry.crime === 'murder'
      expect(!(executed && exiled)).toEqual(true)
    })

    it('might execute a murderer who\'s tried to kill before', () => {
      const c = new Community()
      const murderer = new Person()
      c.add(murderer)
      const oldVictim = new Person()
      const newVictim = new Person()
      murderer.murder([], [ oldVictim ])
      murderer.murder([ newVictim ], [])
      c.judgeMurder({
        murderer,
        victims: [ newVictim ],
        attempted: [],
        outcome: 'murder'
      })
      const today = new Date()
      const record = murderer.history.get({ year: today.getFullYear(), tags: [ 'exile', 'died' ] })
      const entry = isPopulatedArray(record) ? record[0] : false
      const executed = entry && entry.tags.includes('died') && entry.cause === 'executed'
      const exiled = entry && entry.tags.includes('left') && entry.crime === 'murder'
      expect(!(executed && exiled)).toEqual(true)
    })

    it('might exile someone who tried to kill someone', () => {
      const c = new Community()
      const murderer = new Person()
      c.add(murderer)
      const victim = new Person()
      murderer.murder([], [ victim ])
      c.judgeMurder({
        murderer,
        victims: [],
        attempted: [ victim ],
        outcome: 'attempted'
      })
      const today = new Date()
      const record = murderer.history.get({ year: today.getFullYear(), tags: [ 'exile' ] })
      const entry = isPopulatedArray(record) ? record[0] : false
      const exiled = entry.tags && entry.tags.includes('left') && entry.crime === 'attempted murder'
      expect(exiled || !entry).toEqual(true)
    })

    it('won\'t execute someone for attempted murder', () => {
      const c = new Community()
      const murderer = new Person()
      c.add(murderer)
      const victim = new Person()
      murderer.murder([], [ victim ])
      c.judgeMurder({
        murderer,
        victims: [],
        attempted: [ victim ],
        outcome: 'attempted'
      })
      const today = new Date()
      const record = murderer.history.get({ year: today.getFullYear(), tags: [ 'exile' ] })
      const entry = isPopulatedArray(record) ? record[0] : false
      const executed = Boolean(entry.tags) && entry.tags.includes('died') && entry.cause === 'executed'
      expect(executed).toEqual(false)
    })

    it('records that a crime happened', () => {
      const c = new Community()
      const murderer = new Person()
      c.add(murderer)
      const victim = new Person()
      murderer.murder([ victim ])
      c.judgeMurder({
        murderer,
        victims: [ victim ],
        attempted: [],
        outcome: 'murder',
        year: 2020
      })
      const record = c.history.get({ tags: [ 'crime' ] })
      expect(record.length).toEqual(1)
    })

    it('records the crime', () => {
      const c = new Community()
      const murderer = new Person()
      c.add(murderer)
      const victim = new Person()
      murderer.murder([ victim ])
      c.judgeMurder({
        murderer,
        victims: [ victim ],
        attempted: [],
        outcome: 'murder',
        year: 2020
      })
      const record = c.history.get({ tags: [ 'murder' ] })
      expect(record.length).toEqual(1)
    })

    it('records the perpetrator', () => {
      const c = new Community()
      const murderer = new Person()
      c.add(murderer)
      const victim = new Person()
      murderer.murder([ victim ])
      c.judgeMurder({
        murderer,
        victims: [ victim ],
        attempted: [],
        outcome: 'murder',
        year: 2020
      })
      const record = c.history.get({ tags: [ 'murder' ] })
      const entry = isPopulatedArray(record) ? record[0] : {}
      const perp = entry.perpetrator ? entry.perpetrator : false
      expect(perp).toEqual(murderer)
    })

    it('records the victims', () => {
      const c = new Community()
      const murderer = new Person()
      c.add(murderer)
      const victim = new Person()
      murderer.murder([ victim ])
      c.judgeMurder({
        murderer,
        victims: [ victim ],
        attempted: [],
        outcome: 'murder',
        year: 2020
      })
      const record = c.history.get({ tags: [ 'murder' ] })
      const entry = isPopulatedArray(record) ? record[0] : {}
      const victims = entry.victims ? entry.victims : false
      expect(victims).toEqual([ victim ])
    })

    it('records who the assailant tried and failed to murder', () => {
      const c = new Community()
      const murderer = new Person()
      c.add(murderer)
      const victim = new Person()
      const survivor = new Person()
      murderer.murder([ victim ], [ survivor ])
      c.judgeMurder({
        murderer,
        victims: [ victim ],
        attempted: [ survivor ],
        outcome: 'murder',
        year: 2020
      })
      const record = c.history.get({ tags: [ 'murder' ] })
      const entry = isPopulatedArray(record) ? record[0] : {}
      const attempted = entry.attempted ? entry.attempted : false
      expect(attempted).toEqual([ survivor ])
    })

    it('records the community\'s judgment (execution, exile, or reconciliation for murder)', () => {
      const c = new Community()
      const murderer = new Person()
      c.add(murderer)
      const victim = new Person()
      murderer.murder([ victim ])
      c.judgeMurder({
        murderer,
        victims: [ victim ],
        attempted: [],
        outcome: 'murder',
        year: 2020
      })
      const record = c.history.get({ tags: [ 'murder' ] })
      const entry = isPopulatedArray(record) ? record[0] : {}
      const judgment = entry.judgment ? entry.judgment : false
      const possibilities = [ 'execution', 'exile', 'reconciliation' ]
      expect(possibilities.includes(judgment)).toEqual(true)
    })

    it('records the community\'s judgment (exile or reconciliation for attempted murder)', () => {
      const c = new Community()
      const murderer = new Person()
      c.add(murderer)
      const victim = new Person()
      murderer.murder([ victim ])
      c.judgeMurder({
        murderer,
        victims: [],
        attempted: [ victim ],
        outcome: 'attempted',
        year: 2020
      })
      const record = c.history.get({ tags: [ 'attempted murder' ] })
      const entry = isPopulatedArray(record) ? record[0] : {}
      const judgment = entry.judgment ? entry.judgment : false
      const possibilities = [ 'exile', 'reconciliation' ]
      expect(possibilities.includes(judgment)).toEqual(true)
    })
  })

  describe('reinforceMonogamy', () => {
    it('sets monogamy if it wasn\'t already', () => {
      const c = new Community()
      c.reinforceMonogamy()
      expect(c.traditions.monogamy).toEqual(1)
    })

    it('increases monogamy by 5%', () => {
      const c = new Community()
      c.traditions = { monogamy: 0.7 }
      c.reinforceMonogamy()
      expect(c.traditions.monogamy).toEqual(0.75)
    })
  })

  describe('reduceMonogamy', () => {
    it('sets monogamy if it wasn\'t already', () => {
      const c = new Community()
      c.reduceMonogamy()
      expect(c.traditions.monogamy).toEqual(0)
    })

    it('reduces monogamy by 1%', () => {
      const c = new Community()
      c.traditions = { monogamy: 0.7 }
      c.reduceMonogamy()
      expect(c.traditions.monogamy).toEqual(0.69)
    })
  })

  describe('addFounder', () => {
    it('adds a new person to the community', () => {
      const c = new Community()
      c.addFounder()
      expect(c.people.length).toEqual(1)
    })

    it('adds a founder to the community', () => {
      const c = new Community()
      c.addFounder()
      expect(c.people[0].founder).toEqual(true)
    })
  })

  describe('considerFounder', () => {
    it('adds a founder to a hunter-gatherer band with no one in it about two thirds of the time', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const c = new Community()
        c.considerFounder(2020)
        if (c.people.length > 0) count++
      }
      expect((count > 46) && (count < 86)).toEqual(true)
    })

    it('doesn\'t add a founder to a hunter-gatherer band if it already has 10 founders', () => {
      const c = new Community()
      for (let i = 0; i < 10; i++) c.addFounder(2020)
      c.considerFounder(2020)
      expect(c.people.length).toEqual(10)
    })

    it('adds a founder to a village with no one in it about 83% of the time', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const c = new Community()
        c.traditions = { village: true }
        c.considerFounder(2020)
        if (c.people.length > 0) count++
      }
      expect((count > 73) && (count < 93)).toEqual(true)
    })

    it('doesn\'t add a founder to a village if it already has 50 founders', () => {
      const c = new Community()
      c.traditions = { village: true }
      for (let i = 0; i < 50; i++) c.addFounder(2020)
      c.considerFounder(2020)
      expect(c.people.length).toEqual(50)
    })
  })

  describe('run', () => {
    it('runs for 200 years by default', () => {
      const c = new Community()
      c.run()
      expect(c.history.record.length).toEqual(200)
    })

    it('runs for the number of years specified', () => {
      const c = new Community()
      c.run(300)
      expect(c.history.record.length).toEqual(300)
    })

    it('won\'t do less than 50 years', () => {
      const c = new Community()
      c.run(5)
      expect(c.history.record.length).toEqual(50)
    })

    it('includes other data in the history', () => {
      const c = new Community()
      c.run()
      const entry = c.history.record[random.int(0, 199)]
      const actual = [
        typeof entry.population === 'number',
        typeof entry.yield === 'number',
        typeof entry.lean === 'boolean',
        typeof entry.sick === 'boolean',
        typeof entry.conflict === 'boolean'
      ]
      expect(allTrue(actual)).toEqual(true)
    })

    it('adds approx. 30 founders for a hunter-gatherer band', () => {
      const c = new Community()
      c.run()
      const founders = c.people.filter(p => p.founder).length
      const notTooMany = founders < 40
      const notTooFew = founders > 20
      expect(notTooMany && notTooFew)
    })

    it('adds approx. 150 founders for a village', () => {
      const c = new Community()
      c.traditions = { village: true }
      c.run()
      const founders = Object.keys(c.people)
        .map(key => c.people[key])
        .filter(p => p.founder)
      const notTooMany = founders.length < 175
      const notTooFew = founders.length > 125
      expect(notTooMany && notTooFew)
    })
  })
})
