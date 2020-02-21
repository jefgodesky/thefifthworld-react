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
