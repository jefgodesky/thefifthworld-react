/* global describe, it, expect */

import Community from './community'
import History from './history'
import Person from './person'
import Polycule from './polycule'

describe('Polycule', () => {
  describe('constructor', () => {
    it('marks the polycule as active', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const p = new Polycule(a, b, c)
      expect(p.active).toEqual(true)
    })

    it('sets up an array of members', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const p = new Polycule(a, b, c)
      expect(p.people).toEqual([ a.id, b.id, c.id ])
    })

    it('sets up a love matrix', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const p = new Polycule(a, b, c)

      const expected = {
        'm1': { 'm2': 1, 'm3': 1 },
        'm2': { 'm1': 1, 'm3': 1 },
        'm3': { 'm1': 1, 'm2': 1 }
      }

      expect(p.love).toEqual(expected)
    })

    it('initializes an array for children', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const p = new Polycule(a, b, c)
      expect(p.children).toEqual([])
    })

    it('starts a history', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const p = new Polycule(a, b, c)
      expect(p.history).toBeInstanceOf(History)
    })

    it('creates an entry for the formation of the polycule', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const p = new Polycule(a, b, c)
      const records = p.history.get({ tag: 'formed' })
      expect(records).toHaveLength(1)
    })

    it('records who the original members of the polycule were', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const p = new Polycule(a, b, c)
      const records = p.history.get({ tag: 'formed' })
      expect(records[0].members).toEqual([ a.id, b.id, c.id ])
    })

    it('notes in your personal history that you formed a polycule', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      new Polycule(a, b, c)
      expect(a.history.get({ tag: 'formed' })).toHaveLength(1)
    })

    it('notes your partners in your history', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      new Polycule(a, b, c)
      const records = a.history.get({ tag: 'formed' })
      expect(records[0].partners).toEqual([ b.id, c.id ])
    })
  })

  describe('add', () => {
    it('increases the size of the polycule', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const p = new Polycule(a, b)
      p.add(c)
      expect(p.people).toHaveLength(3)
    })

    it('adds the new member to the polycule', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const p = new Polycule(a, b)
      p.add(c)
      expect(p.people).toEqual([ a.id, b.id, c.id ])
    })

    it('notes that this person belongs to a polycule', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const p = new Polycule(a, b)
      p.add(c)
      expect(c.polycule).toEqual(true)
    })

    it('notes the ID of the polycule you joined', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const p = new Polycule(a, b)
      p.id = 'p1'
      p.add(c)
      expect(c.polycule).toEqual('p1')
    })

    it('creates a matrix of how much you love the others', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const p = new Polycule(a, b)
      p.add(c)
      expect(p.love.m3).toEqual({ 'm1': 1, 'm2': 1 })
    })

    it('creates a matrix of how much the others love you', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const p = new Polycule(a, b)
      p.add(c)
      const actual = [ p.love.m1, p.love.m2 ]
      const expected = [
        { 'm2': 1, 'm3': 1 },
        { 'm1': 1, 'm3': 1 }
      ]
      expect(actual).toEqual(expected)
    })

    it('notes the expansion in the polycule history', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const p = new Polycule(a, b)
      p.add(c)
      expect(p.history.get({ tag: 'expanded' })).toHaveLength(1)
    })

    it('notes the expansion in the personal history of the person added', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const p = new Polycule(a, b)
      p.add(c, community)
      const expected = { year: c.present, tags: [ 'polycule', 'joined' ], polycule: p.id, partners: [ a.id, b.id ], size: 3 }
      expect(c.history.get({ tag: 'joined' })).toEqual([ expected ])
    })

    it('notes the expansion in the personal histories of the other people', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const p = new Polycule(a, b)
      p.add(c, community)
      const expected = { year: c.present, tags: [ 'polycule', 'expanded' ], polycule: p.id, joined: c.id, size: 3 }
      expect(a.history.get({ tag: 'expanded' })).toEqual([ expected ])
    })
  })

  describe('remove', () => {
    it('decreases the size of the polycule', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const p = new Polycule(a, b, c)
      p.remove(c)
      expect(p.people).toHaveLength(2)
    })

    it('removes the person from the polycule', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const p = new Polycule(a, b, c)
      p.remove(c)
      expect(p.people).toEqual([ a.id, b.id ])
    })

    it('deletes that person\'s polycule reference altogether', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const p = new Polycule(a, b, c)
      p.remove(c)
      expect(c.polycule).not.toBeDefined()
    })

    it('removes the person from the love matrix', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const p = new Polycule(a, b, c)
      p.remove(c)
      const expected = { 'm1': { 'm2': 1 }, 'm2': { 'm1': 1 } }
      expect(p.love).toEqual(expected)
    })

    it('notes the contraction in the polycule history', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const p = new Polycule(a, b, c)
      p.remove(c)
      expect(p.history.get({ tag: 'contracted' })).toHaveLength(1)
    })

    it('notes the removal in the personal history of the person removed', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const p = new Polycule(a, b, c)
      p.remove(c, community)
      const expected = { year: c.present, tags: [ 'polycule', 'removed' ], polycule: p.id }
      expect(c.history.get({ tag: 'removed' })).toEqual([ expected ])
    })

    it('notes the contraction in the personal histories of the other people', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const p = new Polycule(a, b, c)
      p.remove(c, community)
      const expected = { year: a.present, tags: [ 'polycule', 'contracted' ], polycule: p.id, removed: c.id, partners: [ b.id ], size: 2 }
      expect(a.history.get({ tag: 'contracted' })).toEqual([ expected ])
    })

    it('goes to breakup instead if given a community and you\'re removing one of the last two', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const p = new Polycule(a, b)
      p.remove(b, community)
      expect(p.history.get({ tag: 'breakup' })).toHaveLength(1)
    })
  })

  describe('breakup', () => {
    it('marks the polycule as not active', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const p = new Polycule(a, b, c)
      p.breakup(community)
      expect(p.active).toEqual(false)
    })

    it('deletes each member\'s polycule reference', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const p = new Polycule(a, b, c)
      p.breakup(community)
      const actual = [ a.polycule, b.polycule, c.polycule ]
      const expected = [ undefined, undefined, undefined ]
      expect(actual).toEqual(expected)
    })

    it('adds the event to the polycule\'s history', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const p = new Polycule(a, b, c)
      p.breakup(community)
      const record = p.history.get({ tag: 'breakup' })
      const expected = { year: a.present, tags: [ 'breakup' ], partners: [ a.id, b.id, c.id ], size: 3 }
      expect(record).toEqual([ expected ])
    })

    it('adds the event to the personal histories of each member', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person(community)
      const c = new Person(community)
      const p = new Polycule(a, b, c)
      p.breakup(community)
      const record = a.history.get({ tag: 'breakup' })
      const expected = { year: a.present, tags: [ 'polycule', 'breakup' ], partners: [ b.id, c.id ], size: 3 }
      expect(record).toEqual([ expected ])
    })
  })
})
