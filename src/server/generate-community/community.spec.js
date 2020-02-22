/* global describe, it, expect */

import random from 'random'

import Community from './community'
import History from './history'
import Person from './person'

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
})
