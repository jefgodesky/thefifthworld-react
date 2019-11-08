/* global describe, it, expect */

import Community from './community'
import Person from './person'

describe('Community', () => {
  describe('constructor', () => {
    it('copies properties from object', () => {
      const obj = { prop1: true, prop2: false }
      const community = new Community(obj)
      const actual = [
        community.prop1 === true,
        community.prop2 === false
      ]
      expect(actual.reduce((acc, curr) => acc && curr, true)).toEqual(true)
    })

    it('sets a random starting discord', () => {
      const community = new Community({})
      expect(community.status.discord).toBeGreaterThan(0)
    })
  })

  describe('getLivingPopulation', () => {
    it('returns the number of people alive in the community', () => {
      const community = new Community({})
      const p1 = community.addPerson(new Person())
      const p2 = community.addPerson(new Person())
      community.people[p1].died = true
      const actual = community.getLivingPopulation()
      expect(actual).toEqual([ p2 ])
    })
  })

  describe('setStatus', () => {
    it('sets the community status', () => {
      const community = new Community({})
      community.setStatus()
      const events = [ 'peace', 'conflict', 'lean', 'sickness' ]
      const actual = [
        community.status.discord >= 0,
        events.includes(community.status.event)
      ]
      expect(actual.reduce((acc, curr) => acc && curr, true)).toEqual(true)
    })
  })

  describe('addPerson', () => {
    it('adds a person to the community', () => {
      const community = new Community({})
      community.addPerson(new Person())
      expect(Object.keys(community.people).length).toEqual(1)
    })

    it('returns the new person\'s ID in the community index', () => {
      const community = new Community({})
      const actual = community.addPerson(new Person())
      expect(actual).toEqual('0')
    })
  })

  describe('run', () => {
    it('chronicles 150 years of history', () => {
      const community = new Community({})
      community.run()
      expect(community.chronicle.length).toEqual(150)
    })
  })
})
