/* global describe, it, expect */

import random from 'random'

import Community from './community'
import History from './history'
import Person from './person'
import Polycule from './polycule'

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

    it('starts an empty object for polycules', () => {
      const c = new Community()
      expect(c.polycules).toEqual({})
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

    it('adds a polycule to the community', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const p = new Polycule(a, b, c)
      community.add(p)
      expect(Object.keys(community.polycules).length).toEqual(1)
    })

    it('sets the polycule\'s ID', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const p = new Polycule(a, b, c)
      community.add(p)
      expect(p.id).toEqual('p1')
    })

    it('returns the polycule\'s ID', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const p = new Polycule(a, b, c)
      expect(community.add(p)).toEqual('p1')
    })
  })

  describe('startPolycule', () => {
    it('returns the polycule\'s key', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      expect(community.startPolycule(a, b, c)).toEqual('p1')
    })

    it('adds the polycule to the community', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const key = community.startPolycule(a, b, c)
      expect(community.polycules[key]).toBeInstanceOf(Polycule)
    })

    it('adds the given people to the community', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const key = community.startPolycule(a, b, c)
      expect(community.polycules[key].people).toEqual([ 'm1', 'm2', 'm3' ])
    })

    it('adds polycule ID to each of the members', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const key = community.startPolycule(a, b, c)
      const actual = [ a.polycule, b.polycule, c.polycule ]
      const expected = [ key, key, key ]
      expect(actual).toEqual(expected)
    })

    it('adds anyone not in the community to the community', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person()
      community.startPolycule(a, b, c)
      expect(Object.keys(community.people)).toContain(c.id)
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

  describe('getPolyculeMembers', () => {
    it('returns the members of a polycule', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const key = community.startPolycule(a, b, c)
      expect(community.getPolyculeMembers(key)).toEqual([ a, b, c ])
    })

    it('returns the other members of a polycule if given a self as a point of reference', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const key = community.startPolycule(a, b, c)
      expect(community.getPolyculeMembers(key, c)).toEqual([ a, b ])
    })

    it('returns an empty array if self isn\'t in the polycule', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const key = community.startPolycule(a, b)
      expect(community.getPolyculeMembers(key, c)).toEqual([])
    })

    it('returns an empty array if given an invalid ID', () => {
      const community = new Community()
      expect(community.getPolyculeMembers('p1')).toEqual([])
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
    it('returns the percentage of recent years that had problems', () => {
      const c = new Community()
      c.history.add(2015, { conflict: false, sick: false, lean: false })
      c.history.add(2016, { conflict: true, sick: false, lean: false })
      c.history.add(2017, { conflict: false, sick: false, lean: false })
      c.history.add(2018, { conflict: false, sick: false, lean: false })
      c.history.add(2019, { conflict: false, sick: false, lean: false })
      c.history.add(2020, { conflict: false, sick: true, lean: false })
      expect(c.hadProblemsRecently()).toEqual(40)
    })

    it('always returns a value equal to or greater than zero', () => {
      const c = new Community()
      for (let i = 6; i > -1; i--) {
        c.history.add(2020 - i, {
          conflict: random.boolean(),
          sick: random.boolean(),
          lean: random.boolean()
        })
      }
      expect(c.hadProblemsRecently()).toBeGreaterThanOrEqual(0)
    })

    it('always returns a value equal to or less than 100', () => {
      const c = new Community()
      for (let i = 6; i > -1; i--) {
        c.history.add(2020 - i, {
          conflict: random.boolean(),
          sick: random.boolean(),
          lean: random.boolean()
        })
      }
      expect(c.hadProblemsRecently()).toBeLessThanOrEqual(100)
    })

    it('checks the number of years requested', () => {
      const c = new Community()
      c.history.add(2008, { conflict: false, sick: false, lean: true })
      c.history.add(2009, { conflict: false, sick: false, lean: false })
      c.history.add(2010, { conflict: false, sick: false, lean: false })
      c.history.add(2011, { conflict: false, sick: false, lean: false })
      c.history.add(2012, { conflict: false, sick: false, lean: false })
      c.history.add(2013, { conflict: false, sick: false, lean: false })
      c.history.add(2014, { conflict: false, sick: false, lean: false })
      c.history.add(2015, { conflict: false, sick: false, lean: false })
      c.history.add(2016, { conflict: false, sick: false, lean: false })
      c.history.add(2017, { conflict: false, sick: false, lean: false })
      c.history.add(2018, { conflict: false, sick: false, lean: false })
      c.history.add(2019, { conflict: false, sick: false, lean: false })
      c.history.add(2020, { conflict: false, sick: false, lean: false })
      expect(c.hadProblemsRecently(13)).toBeGreaterThan(0)
    })

    it('checks the years that are in the history', () => {
      const c = new Community()
      c.history.add(2019, { conflict: false, sick: false, lean: false })
      c.history.add(2020, { conflict: true, sick: false, lean: false })
      expect(c.hadProblemsRecently()).toEqual(50)
    })
  })
})
