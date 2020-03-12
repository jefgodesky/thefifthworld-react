/* global describe, it, expect */

import random from 'random'

import Community from './community'
import History from './history'
import Person from './person'

import { sabotage, assault, adultery } from './crime'

describe('Community', () => {
  describe('constructor', () => {
    it('copies data provided', () => {
      const data = { test: { val: 57 } }
      const c = new Community(data)
      expect(c.test.val).toEqual(57)
    })

    it('starts a new history', () => {
      const c = new Community()
      expect(c.history).toBeInstanceOf(History)
    })

    it('starts an empty object for people', () => {
      const c = new Community()
      expect(c.people).toEqual({})
    })

    it('initializes territory yield', () => {
      const c = new Community()
      expect(c.territory.yield).toEqual(0)
    })

    it('initializes status', () => {
      const c = new Community()
      const { lean, sick, conflict } = c.status
      expect([ lean, sick, conflict ]).toEqual([ false, false, false ])
    })
  })

  describe('add', () => {
    it('adds a person to the community', () => {
      const p = new Person()
      const c = new Community()
      c.add(p)
      expect(Object.keys(c.people).length).toEqual(1)
    })

    it('sets the person\'s ID', () => {
      const p = new Person()
      const c = new Community()
      c.add(p)
      expect(p.id).toEqual('m1')
    })

    it('returns the person\'s ID', () => {
      const p = new Person()
      const c = new Community()
      expect(c.add(p)).toEqual('m1')
    })
  })

  describe('getPeople', () => {
    it('returns an array of the people in the community', () => {
      const num = random.int(1, 25)
      const c = new Community()
      for (let i = 0; i < num; i++) {
        const p = new Person()
        c.add(p)
      }
      expect(c.getPeople()).toHaveLength(num)
    })

    it('doesn\'t include anyone who\'s left', () => {
      const c = new Community()
      const p1 = new Person(); c.add(p1)
      const p2 = new Person(); c.add(p2)
      const p3 = new Person(); c.add(p3)
      p3.leave()
      expect(c.getPeople()).toHaveLength(2)
    })

    it('doesn\'t include anyone who\'s died', () => {
      const c = new Community()
      const p1 = new Person(); c.add(p1)
      const p2 = new Person(); c.add(p2)
      const p3 = new Person(); c.add(p3)
      p3.die()
      expect(c.getPeople()).toHaveLength(2)
    })
  })

  describe('getMasters', () => {
    it('gets an array of the people who have mastered a given skill', () => {
      const skill = 'Acting'
      const community = new Community()
      const a = new Person(community)
      a.skills.mastered = [ skill ]
      const b = new Person(community)
      b.skills.mastered = [ skill ]
      const c = new Person(community)
      const d = new Person(community)
      community.people = [ a, b, c, d ]
      expect(community.getMasters(skill)).toHaveLength(2)
    })
  })

  describe('pickRandom', () => {
    it('chooses a random person from the community', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      community.people = [ a, b, c ]
      expect(community.people.includes(community.pickRandom())).toEqual(true)
    })

    it('doesn\'t pick someone who\'s left', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      c.leave()
      const expected = [ a, b ]
      expect(expected.includes(community.pickRandom())).toEqual(true)
    })

    it('doesn\'t pick someone who\'s died', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      c.die()
      const expected = [ a, b ]
      expect(expected.includes(community.pickRandom())).toEqual(true)
    })

    it('doesn\'t pick someone who\'s excluded', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const d = new Person(community)
      const expected = [ a, b ]
      expect(expected.includes(community.pickRandom(c, d))).toEqual(true)
    })
  })

  describe('isCurrentMember', () => {
    it('returns false if given someone who isn\'t in the community', () => {
      const c = new Community()
      const p = new Person()
      expect(c.isCurrentMember(p)).toEqual(false)
    })

    it('returns true if given someone who is in the community', () => {
      const c = new Community()
      const p = new Person(c)
      expect(c.isCurrentMember(p)).toEqual(true)
    })

    it('returns false if given someone who left the community', () => {
      const c = new Community()
      const p = new Person(c)
      p.leave()
      expect(c.isCurrentMember(p)).toEqual(false)
    })

    it('returns false if given someone who has died', () => {
      const c = new Community()
      const p = new Person(c)
      p.die()
      expect(c.isCurrentMember(p)).toEqual(false)
    })

    it('returns false if given an ID that isn\'t in the community', () => {
      const c = new Community()
      expect(c.isCurrentMember('nope')).toEqual(false)
    })

    it('returns true if given the ID of someone who is in the community', () => {
      const c = new Community()
      const p = new Person(c)
      expect(c.isCurrentMember(p.id)).toEqual(true)
    })

    it('returns false if given the ID of someone who left the community', () => {
      const c = new Community()
      const p = new Person(c)
      p.leave()
      expect(c.isCurrentMember(p.id)).toEqual(false)
    })

    it('returns false if given the ID of someone who has died', () => {
      const c = new Community()
      const p = new Person(c)
      p.die()
      expect(c.isCurrentMember(p.id)).toEqual(false)
    })
  })

  describe('getRecentHistory', () => {
    it('returns the most recent 10 years', () => {
      const c = new Community()
      for (let y = 2000; y < 2020; y++) {
        c.history.add(y, { tags: [ 'test' ] })
      }
      expect(c.getRecentHistory()).toHaveLength(10)
    })

    it('returns the most recent years requested', () => {
      const c = new Community()
      for (let y = 2000; y < 2020; y++) {
        c.history.add(y, { tags: [ 'test' ] })
      }
      const num = random.int(5, 15)
      expect(c.getRecentHistory(num)).toHaveLength(num)
    })
  })

  describe('getRecentViolentDeaths', () => {
    it('returns the number of recent deaths due to assault', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      a.die('homicide')
      a.history.add(a.present, {
        tags: [ 'crime', 'assault', 'murder', 'died' ],
        attacker: c.id,
        defender: a.id,
        lethal: true
      })
      b.die('infection')
      b.history.add(a.present, {
        tags: [ 'crime', 'assault', 'infection', 'died' ],
        attacker: c.id,
        defender: a.id,
        lethal: true
      })
      expect(community.getRecentViolentDeaths()).toEqual(2)
    })

    it('looks at the past 10 years', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      a.die('homicide')
      a.history.add(a.present, {
        tags: [ 'crime', 'assault', 'murder', 'died' ],
        attacker: c.id,
        defender: a.id,
        lethal: true
      })
      b.present += 15
      c.present += 15
      b.die('infection')
      b.history.add(a.present, {
        tags: [ 'crime', 'assault', 'infection', 'died' ],
        attacker: c.id,
        defender: a.id,
        lethal: true
      })
      expect(community.getRecentViolentDeaths()).toEqual(1)
    })

    it('looks at a specified number of years', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      a.die('homicide')
      a.history.add(a.present, {
        tags: [ 'crime', 'assault', 'murder', 'died' ],
        attacker: c.id,
        defender: a.id,
        lethal: true
      })
      b.present += 5
      c.present += 5
      b.die('infection')
      b.history.add(a.present, {
        tags: [ 'crime', 'assault', 'infection', 'died' ],
        attacker: c.id,
        defender: a.id,
        lethal: true
      })
      expect(community.getRecentViolentDeaths(4)).toEqual(1)
    })
  })

  describe('calculateHelp', () => {
    it('can help with a skill', () => {
      const c = new Community()
      const h = new Person(c)
      h.skills.mastered = [ 'Medicine' ]
      expect(c.calculateHelp('Medicine', 25)).toEqual(25)
    })

    it('suffers from diminishing marginal returns', () => {
      const c = new Community()
      const h1 = new Person(c)
      h1.skills.mastered = [ 'Medicine' ]
      const h2 = new Person(c)
      h2.skills.mastered = [ 'Medicine' ]
      const h3 = new Person(c)
      h3.skills.mastered = [ 'Medicine' ]
      expect(c.calculateHelp('Medicine', 25)).toEqual(57.8125)
    })
  })

  describe('adjustMonogamy', () => {
    it('sets a monogamy score', () => {
      const community = new Community()
      community.adjustMonogamy(2020)
      expect(community.traditions.monogamy).not.toBeNaN()
    })

    it('reduces monogamy by each polygamous individual', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person()
      const c = new Person()
      a.takePartner(b, community)
      a.takePartner(c, community)
      community.adjustMonogamy(2020)
      expect(community.traditions.monogamy).toEqual(0.89)
    })

    it('increases monogamy when polygamous individuals are involved in adultery', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person()
      const c = new Person()
      const d = new Person()
      a.takePartner(b, community, true)
      a.takePartner(c, community)
      a.present = 2020; b.present = 2020; c.present = 2020; d.present = 2020
      adultery([ a, d ], community)
      community.adjustMonogamy(2020)
      expect(community.traditions.monogamy).toBeGreaterThanOrEqual(0.9)
    })

    it('doesn\'t increase monogamy when the adultery doesn\'t involve any polygamous individuals', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person()
      const c = new Person()
      a.takePartner(b, community, true)
      a.present = 2020; b.present = 2020; c.present = 2020
      adultery([ a, c ], community)
      community.adjustMonogamy(2020)
      expect(community.traditions.monogamy).toEqual(0.9)
    })
  })

  describe('adjustYield', () => {
    it('adds 30', () => {
      const c = new Community()
      c.adjustYield()
      expect(c.territory.yield).toEqual(30)
    })

    it('adds 150 if you\'re a village', () => {
      const c = new Community({ traditions: { village: true } })
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

  describe('hasProblems', () => {
    it('returns true if the community is experiencing lean times', () => {
      const c = new Community()
      c.status = { conflict: false, sick: false, lean: true }
      expect(c.hasProblems()).toEqual(true)
    })

    it('returns true if the community is experiencing a time of sickness', () => {
      const c = new Community()
      c.status = { conflict: false, sick: true, lean: false }
      expect(c.hasProblems()).toEqual(true)
    })

    it('returns true if the community is experiencing a time of conflict', () => {
      const c = new Community()
      c.status = { conflict: true, sick: false, lean: false }
      expect(c.hasProblems()).toEqual(true)
    })

    it('returns false if the community is not experiencing any major problems', () => {
      const c = new Community()
      c.status = { conflict: false, sick: false, lean: false }
      expect(c.hasProblems()).toEqual(false)
    })
  })

  describe('hadProblems', () => {
    it('returns true if the community experienced lean times', () => {
      const c = new Community()
      c.history.add(2020, { conflict: false, sick: false, lean: true })
      expect(c.hadProblems(2020)).toEqual(true)
    })

    it('returns true if the community experienced sickness', () => {
      const c = new Community()
      c.history.add(2020, { conflict: false, sick: true, lean: false })
      expect(c.hadProblems(2020)).toEqual(true)
    })

    it('returns true if the community experienced conflict', () => {
      const c = new Community()
      c.history.add(2020, { conflict: true, sick: false, lean: false })
      expect(c.hadProblems(2020)).toEqual(true)
    })

    it('returns false if the community did not experience any major problems that year', () => {
      const c = new Community()
      c.history.add(2020, { conflict: false, sick: false, lean: false })
      expect(c.hadProblems(2020)).toEqual(false)
    })
  })

  describe('hadProblemsRecently', () => {
    it('returns 0 if the community has no history', () => {
      const c = new Community()
      expect(c.hadProblemsRecently()).toEqual(0)
    })

    it('returns the percentage of recent years that had problems', () => {
      const c = new Community()
      c.history.add(2015, { tags: [] })
      c.history.add(2016, { tags: [ 'conflict' ] })
      c.history.add(2017, { tags: [] })
      c.history.add(2018, { tags: [] })
      c.history.add(2019, { tags: [] })
      c.history.add(2020, { tags: [ 'sick' ] })
      expect(c.hadProblemsRecently()).toEqual(40)
    })

    it('always returns a value equal to or greater than zero', () => {
      const c = new Community()
      for (let i = 6; i > -1; i--) {
        const tags = []
        if (random.boolean) tags.push('lean')
        if (random.boolean) tags.push('sick')
        if (random.boolean) tags.push('conflict')
        c.history.add(2020 - i, { tags })
      }
      expect(c.hadProblemsRecently()).toBeGreaterThanOrEqual(0)
    })

    it('always returns a value equal to or less than 100', () => {
      const c = new Community()
      for (let i = 6; i > -1; i--) {
        const tags = []
        if (random.boolean) tags.push('lean')
        if (random.boolean) tags.push('sick')
        if (random.boolean) tags.push('conflict')
        c.history.add(2020 - i, { tags })
      }
      expect(c.hadProblemsRecently()).toBeLessThanOrEqual(100)
    })

    it('checks the number of years requested', () => {
      const c = new Community()
      c.history.add(2008, { tags: [ 'lean' ] })
      c.history.add(2009, { tags: [] })
      c.history.add(2010, { tags: [] })
      c.history.add(2011, { tags: [] })
      c.history.add(2012, { tags: [] })
      c.history.add(2013, { tags: [] })
      c.history.add(2014, { tags: [] })
      c.history.add(2015, { tags: [] })
      c.history.add(2016, { tags: [] })
      c.history.add(2017, { tags: [] })
      c.history.add(2018, { tags: [] })
      c.history.add(2019, { tags: [] })
      c.history.add(2020, { tags: [] })
      expect(c.hadProblemsRecently(13)).toBeGreaterThan(0)
    })

    it('checks the years that are in the history', () => {
      const c = new Community()
      c.history.add(2019, { tags: [] })
      c.history.add(2020, { tags: [ 'conflict' ] })
      expect(c.hadProblemsRecently()).toEqual(50)
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
      c.territory.yield = 0
      c.solveProblems()
      expect(c.status.lean).toEqual(false)
    })

    it('ends sickness more than 25% of the time', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const c = new Community()
        c.status.sick = true
        c.solveProblems()
        if (!c.status.sick) count++
      }
      expect(count).toBeGreaterThan(25)
    })

    it('ends sickness less than 75% of the time', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const c = new Community()
        c.status.sick = true
        c.solveProblems()
        if (!c.status.sick) count++
      }
      expect(count).toBeLessThan(75)
    })

    it('ends sickness if you have three healers more than 50% of the time', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const community = new Community()
        const a = new Person(community)
        const b = new Person(community)
        const c = new Person(community)
        a.skills.mastered = [ 'Medicine' ]
        b.skills.mastered = [ 'Medicine' ]
        c.skills.mastered = [ 'Medicine' ]
        community.status.sick = true
        community.solveProblems()
        if (!community.status.sick) count++
      }
      expect(count).toBeGreaterThan(50)
    })

    it('ends conflict more than 25% of the time', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const c = new Community()
        c.status.conflict = true
        c.solveProblems()
        if (!c.status.conflict) count++
      }
      expect(count).toBeGreaterThan(25)
    })

    it('ends conflict less than 75% of the time', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const c = new Community()
        c.status.conflict = true
        c.solveProblems()
        if (!c.status.conflict) count++
      }
      expect(count).toBeLessThan(75)
    })

    it('ends conflict if you have three peacemakers more than 50% of the time', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const community = new Community()
        const a = new Person(community)
        const b = new Person(community)
        const c = new Person(community)
        a.skills.mastered = [ 'Deescalation' ]
        b.skills.mastered = [ 'Deescalation' ]
        c.skills.mastered = [ 'Deescalation' ]
        community.status.conflict = true
        community.solveProblems()
        if (!community.status.conflict) count++
      }
      expect(count).toBeGreaterThan(50)
    })
  })

  describe('generateStrangers', () => {
    it('returns at least 5 strangers', () => {
      const c = new Community()
      c.generateStrangers()
      expect(c.strangers.length).toBeGreaterThanOrEqual(5)
    })

    it('returns at most 10 strangers', () => {
      const c = new Community()
      c.present = 2020
      c.generateStrangers()
      expect(c.strangers.length).toBeLessThanOrEqual(10)
    })

    it('returns a number of strangers at least as large as 1/8 of the community\'s population', () => {
      const c = new Community()
      c.present = 2020
      for (let i = 0; i < 120; i++) { const p = new Person(); c.add(p) }
      c.generateStrangers()
      expect(c.strangers.length).toBeGreaterThanOrEqual(15)
    })

    it('returns a number of strangers at most as large as 1/4 of the community\'s population', () => {
      const c = new Community()
      c.present = 2020
      for (let i = 0; i < 120; i++) { const p = new Person(); c.add(p) }
      c.generateStrangers()
      expect(c.strangers.length).toBeLessThanOrEqual(30)
    })

    it('returns strangers that are at least 16 years old', () => {
      const c = new Community()
      c.present = 2020
      c.generateStrangers()
      const ages = c.strangers.map(p => p.getAge())
      expect(Math.min(...ages)).toBeGreaterThanOrEqual(16)
    })

    it('returns strangers that are at most 65 years old', () => {
      const c = new Community()
      c.present = 2020
      c.generateStrangers()
      const ages = c.strangers.map(p => p.getAge())
      expect(Math.max(...ages)).toBeLessThanOrEqual(66)
    })
  })

  describe('judge', () => {
    it('renders a judgement', () => {
      const community = new Community()
      community.territory = { yield: 10 }
      const a = new Person(community, 1990)
      const b = new Person(community, 1990)
      const c = new Person(community, 1990)
      a.present = 2020; b.present = 2020; c.present = 2020
      community.people = [ a, b, c ]
      const report = sabotage(a, community, true)
      expect(typeof community.judge(a, report)).toEqual('boolean')
    })

    it('condemns a single case of sabotage less than 15% of the time', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const community = new Community()
        community.territory = { yield: 10 }
        const a = new Person(community, 1990)
        const b = new Person(community, 1990)
        const c = new Person(community, 1990)
        a.present = 2020; b.present = 2020; c.present = 2020
        community.people = [ a, b, c ]
        const report = sabotage(a, community, true)
        if (community.judge(a, report)) count++
      }
      expect(count).toBeLessThan(15)
    })

    it('condemns three cases of sabotage less than 100% of the time', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const community = new Community()
        community.territory = { yield: 10 }
        const a = new Person(community, 1990)
        const b = new Person(community, 1990)
        const c = new Person(community, 1990)
        a.present = 2020; b.present = 2020; c.present = 2020
        community.people = [ a, b, c ]
        sabotage(a, community)
        sabotage(a, community)
        const report = sabotage(a, community, true)
        if (community.judge(a, report)) count++
      }
      expect(count).toBeLessThan(100)
    })

    it('condemns a single assault less than 40% of the time', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const community = new Community()
        const a = new Person(community, 1990)
        const b = new Person(community, 1990)
        const c = new Person(community, 1990)
        a.present = 2020; b.present = 2020; c.present = 2020
        community.people = [ a, b, c ]
        const report = assault(a, b, community, false, true)
        if (community.judge(a, report)) count++
      }
      expect(count).toBeLessThan(40)
    })

    it('condemns three cases of assault less than 100% of the time', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const community = new Community()
        const a = new Person(community, 1990)
        const b = new Person(community, 1990)
        const c = new Person(community, 1990)
        a.present = 2020; b.present = 2020; c.present = 2020
        community.people = [ a, b, c ]
        assault(a, b, community, false)
        assault(a, b, community, false)
        const report = assault(a, b, community, false, true)
        if (community.judge(a, report)) count++
      }
      expect(count).toBeLessThan(100)
    })

    it('condemns a single case of murder less than 75% of the time', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const community = new Community()
        const a = new Person(community, 1990)
        const b = new Person(community, 1990)
        const c = new Person(community, 1990)
        a.present = 2020; b.present = 2020; c.present = 2020
        community.people = [ a, b, c ]
        const report = assault(a, b, community, true, true)
        if (community.judge(a, report)) count++
      }
      expect(count).toBeLessThan(75)
    })

    it('condemns three cases of murder less than 100% of the time', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const community = new Community()
        const a = new Person(community, 1990)
        const b = new Person(community, 1990)
        const c = new Person(community, 1990)
        const d = new Person(community, 1990)
        const e = new Person(community, 1990)
        a.present = 2020; b.present = 2020; c.present = 2020
        community.people = [ a, b, c, d, e ]
        assault(a, b, community, true)
        assault(a, c, community, true)
        const report = assault(a, d, community, true, true)
        if (community.judge(a, report)) count++
      }
      expect(count).toBeLessThan(100)
    })
  })

  describe('addFounder', () => {
    it('returns the founder', () => {
      const community = new Community()
      expect(community.addFounder(2020)).toBeInstanceOf(Person)
    })

    it('tags the person as a founder', () => {
      const community = new Community()
      const p = community.addFounder(2020)
      expect(p.founder).toEqual(true)
    })

    it('sets the founder\'s birth year', () => {
      const community = new Community()
      const p = community.addFounder(2020)
      expect(p.born.getFullYear()).toEqual(2020)
    })
  })

  describe('considerFounder', () => {
    it('adds a founder to a hunter-gatherer band with no one in it more than 40% of the time', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const c = new Community()
        c.considerFounder(2020)
        if (Object.values(c.people).length > 0) count++
      }
      expect(count).toBeGreaterThan(40)
    })

    it('adds a founder to a hunter-gatherer band with no one in it less than 90% of the time', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const c = new Community()
        c.considerFounder(2020)
        if (Object.values(c.people).length > 0) count++
      }
      expect(count).toBeLessThan(90)
    })

    it('doesn\'t add a founder to a hunter-gatherer band if it already has 15 founders', () => {
      const c = new Community()
      for (let i = 0; i < 15; i++) c.addFounder(2020)
      c.considerFounder(2020)
      expect(Object.values(c.people).length).toEqual(15)
    })

    it('adds at least 10 founders if run 50 times', () => {
      const c = new Community()
      for (let i = 2020; i < 2070; i++) c.considerFounder(i)
      expect(Object.values(c.people).length).toBeGreaterThan(10)
    })

    it('adds not more than 20 founders if run 50 times', () => {
      const c = new Community()
      for (let i = 2020; i < 2070; i++) c.considerFounder(i)
      expect(Object.values(c.people).length).toBeLessThan(20)
    })

    it('adds a founder to a village with no one in it more than 70% of the time', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const c = new Community()
        c.traditions = { village: true }
        c.considerFounder(2020)
        if (Object.values(c.people).length > 0) count++
      }
      expect(count).toBeGreaterThan(70)
    })

    it('adds a founder to a village with no one in it less than 99% of the time', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const c = new Community()
        c.traditions = { village: true }
        c.considerFounder(2020)
        if (Object.values(c.people).length > 0) count++
      }
      expect(count).toBeLessThan(99)
    })

    it('doesn\'t add a founder to a village if it already has 75 founders', () => {
      const c = new Community()
      c.traditions = { village: true }
      for (let i = 0; i < 75; i++) c.addFounder(2020)
      c.considerFounder(2020)
      expect(Object.values(c.people).length).toEqual(75)
    })

    it('adds at least 65 founders if run 50 times', () => {
      const c = new Community()
      c.traditions = { village: true }
      for (let i = 2020; i < 2070; i++) c.considerFounder(i)
      expect(Object.values(c.people).length).toBeGreaterThan(65)
    })

    it('adds not more than 85 founders if run 50 times', () => {
      const c = new Community()
      c.traditions = { village: true }
      for (let i = 2020; i < 2070; i++) c.considerFounder(i)
      expect(Object.values(c.people).length).toBeLessThan(85)
    })
  })

  describe('annual', () => {
    it('generates some strangers', () => {
      const c = new Community()
      c.annual(2020, true)
      expect(c.strangers.length).toBeGreaterThan(0)
    })

    it('records history', () => {
      const c = new Community()
      c.annual(2020, true)
      expect(c.history.get({ year: 2020 }).length).toBeGreaterThan(0)
    })

    it('records the population', () => {
      const c = new Community()
      c.annual(2020, true)
      expect(c.history.get({ year: 2020 })[0].population).not.toBeNaN()
    })

    it('records the yield', () => {
      const c = new Community()
      c.annual(2020, true)
      expect(c.history.get({ year: 2020 })[0].yield).not.toBeNaN()
    })

    it('records if it was a lean year', () => {
      const c = new Community()
      c.annual(2020, true)
      expect(typeof c.history.get({ year: 2020 })[0].lean).toEqual('boolean')
    })

    it('records if the community was sick', () => {
      const c = new Community()
      c.annual(2020, true)
      expect(typeof c.history.get({ year: 2020 })[0].sick).toEqual('boolean')
    })

    it('records if the community was in a conflict', () => {
      const c = new Community()
      c.annual(2020, true)
      expect(typeof c.history.get({ year: 2020 })[0].sick).toEqual('boolean')
    })
  })

  /**
   * These tests take quite a while to run. We want them around, but not in our
   * regular testing suite.
   *

  describe('run', () => {
    it('runs for 200 years by default', () => {
      const c = new Community()
      c.run()
      expect(Object.keys(c.history.record).length).toEqual(200)
    })

    it('runs for the number of years specified', () => {
      const c = new Community()
      c.run(300)
      expect(Object.keys(c.history.record).length).toEqual(300)
    })

    it('won\'t do less than 50 years', () => {
      const c = new Community()
      c.run(5)
      expect(Object.keys(c.history.record).length).toEqual(50)
    })

    it('won\'t do more than 400 years', () => {
      const c = new Community()
      c.run(500)
      expect(Object.keys(c.history.record).length).toEqual(400)
    })

    it('generates a hunter-gatherer band of more than 35', () => {
      const c = new Community()
      c.run()
      const population = c.getPeople().length
      expect(population).toBeGreaterThan(35)
    })

    it('generates a hunter-gatherer band of less than 65', () => {
      const c = new Community()
      c.run()
      const population = c.getPeople().length
      expect(population).toBeLessThan(65)
    })

    it('generates a village of more than 110', () => {
      const c = new Community({ traditions: { village: true } })
      c.run()
      const population = c.getPeople().length
      expect(population).toBeGreaterThan(110)
    })

    it('generates a village of less than 190', () => {
      const c = new Community({ traditions: { village: true } })
      c.run()
      const population = c.getPeople().length
      expect(population).toBeLessThan(190)
    })
  })
   ** */
})
