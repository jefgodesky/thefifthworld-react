/* global describe, it, expect */

import Community from './community'
import Person from './person'
import Polycule from './polycule'

import { allTrue } from '../../shared/utils'

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
        p.love[0][0] === null,
        typeof p.love[0][1] === 'number',
        typeof p.love[0][2] === 'number',
        typeof p.love[1][0] === 'number',
        p.love[1][1] === null,
        typeof p.love[1][2] === 'number',
        typeof p.love[2][0] === 'number',
        typeof p.love[2][1] === 'number',
        p.love[2][2] === null,
        p.love[0][1] === p.love[1][0],
        p.love[0][2] === p.love[2][0],
        p.love[1][2] === p.love[2][1]
      ]
      expect(allTrue(actual)).toEqual(true)
    })

    it('can create a theoretical polycule of one', () => {
      const a = new Person()
      const p = new Polycule(a)
      const actual = [
        p.people.length === 1,
        p.people[0] === a,
        p.love.length === 1,
        p.love[0].length === 1,
        p.love[0][0] === null
      ]
      expect(allTrue(actual)).toEqual(true)
    })

    it('records that the polycule was formed', () => {
      const a = new Person()
      const b = new Person()
      const p = new Polycule(a, b)
      expect(p.history.get({ tags: [ 'formed' ] }).length).toEqual(1)
    })
  })

  describe('getCommunity', () => {
    it('assigns the community of its members', () => {
      const c = new Community()
      const a = new Person()
      const b = new Person()
      c.add(a); c.add(b)
      const p = new Polycule(a, b)
      p.getCommunity()
      expect(p.community).toEqual(c)
    })

    it('assigns the first community it finds', () => {
      const c1 = new Community()
      const c2 = new Community()
      const a = new Person()
      const b = new Person()
      c1.add(a); c2.add(b)
      const p = new Polycule(a, b)
      p.getCommunity()
      expect(p.community).toEqual(c1)
    })

    it('does nothing if there\'s no community to find', () => {
      const a = new Person()
      const b = new Person()
      const p = new Polycule(a, b)
      p.getCommunity()
      expect(p.community).toEqual(undefined)
    })
  })

  describe('getPresent', () => {
    it('returns the present for the polycule', () => {
      const a = new Person()
      a.present = 2020
      const b = new Person()
      b.present = 2020
      const p = new Polycule(a, b)
      expect(p.getPresent()).toEqual(2020)
    })

    it('uses the maximum present from among its members', () => {
      const a = new Person()
      a.present = 2020
      const b = new Person()
      b.present = 2019
      const p = new Polycule(a, b)
      expect(p.getPresent()).toEqual(2020)
    })

    it('ignores non-numbers', () => {
      const a = new Person()
      a.present = 2020
      const b = new Person()
      b.present = 'the year of the rat'
      const p = new Polycule(a, b)
      expect(p.getPresent()).toEqual(2020)
    })
  })

  describe('add', () => {
    it('adds a new partner to the polycule', () => {
      const a = new Person()
      const b = new Person()
      const c = new Person()
      const p = new Polycule(a, b)
      p.add(c)
      const expected = [
        [ null, 1, 1 ],
        [ 1, null, 1 ],
        [ 1, 1, null ]
      ]
      expect(p.love).toEqual(expected)
    })

    it('records the expansion', () => {
      const a = new Person({ born: 2000 })
      const b = new Person({ born: 2000 })
      const c = new Person({ born: 2000 })
      for (let i = 0; i < 20; i++) { a.age(); b.age(); c.age() }
      const p = new Polycule(a, b)
      p.add(c)
      expect(p.history.get({ tags: [ 'expanded' ] }).length).toEqual(1)
    })

    it('adds the community if it didn\'t have one yet', () => {
      const a = new Person({ born: 2000 })
      const b = new Person({ born: 2000 })
      const community = new Community()
      const c = new Person({ born: 2000 })
      community.add(c)
      for (let i = 0; i < 20; i++) { a.age(); b.age(); c.age() }
      const p = new Polycule(a, b)
      p.add(c)
      expect(p.community).toEqual(community)
    })

    it('doesn\'t add the community if it already has one', () => {
      const c1 = new Community()
      const c2 = new Community()
      const a = new Person({ born: 2000 })
      const b = new Person({ born: 2000 })
      const c = new Person({ born: 2000 })
      c1.add(a)
      c2.add(b)
      for (let i = 0; i < 20; i++) { a.age(); b.age(); c.age() }
      const p = new Polycule(a, b)
      p.add(c)
      expect(p.community).toEqual(c1)
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
      ]
      expect(allTrue(actual)).toEqual(true)
    })

    it('saves the polycule to the community', () => {
      const c = new Community()
      const a = new Person()
      const b = new Person()
      c.add(a)
      c.add(b)
      const p = new Polycule(a, b)
      p.commit()
      expect(c.polycules.length).toEqual(1)
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

    it('records that someone left', () => {
      const a = new Person()
      const b = new Person()
      const c = new Person()
      const p = new Polycule(a, b, c)
      p.remove(c)
      expect(p.history.get({ tag: 'reduced' }).length).toEqual(1)
    })

    it('deletes itself if only one person remains', () => {
      const a = new Person()
      const b = new Person()
      const p = new Polycule(a, b)
      p.remove(b)
      const actual = [
        a.polycule === undefined,
        b.polycule === undefined,
        p.love === undefined
      ]
      expect(allTrue(actual)).toEqual(true)
    })
  })

  describe('breakup', () => {
    it('removes itself from each person', () => {
      const a = new Person()
      const b = new Person()
      const p = new Polycule(a, b)
      p.breakup()
      const tests = [
        a.polycule === undefined,
        b.polycule === undefined
      ]
      expect(allTrue(tests)).toEqual(true)
    })

    it('removes itself from the community list', () => {
      const c = new Community()
      const a = new Person()
      const b = new Person()
      c.add(a)
      c.add(b)
      const p = new Polycule(a, b)
      p.commit()
      p.breakup()
      expect(c.polycules.length).toEqual(0)
    })

    it('records that the polycule dissolved', () => {
      const a = new Person()
      const b = new Person()
      const p = new Polycule(a, b)
      p.breakup(2020)
      expect(p.history.get({ tag: 'dissolved' }).length).toEqual(1)
    })

    it('records when the polycule breaks up due to adultery', () => {
      const a = new Person()
      const b = new Person()
      const p = new Polycule(a ,b)
      p.breakup(2020, [ a ])
      const entry = p.history.get({ tag: 'dissolved' })
      expect(entry[0].tags.includes('adultery')).toEqual(true)
    })

    it('records who cheated when the polycule breaks up due to adultery', () => {
      const a = new Person()
      const b = new Person()
      const p = new Polycule(a ,b)
      p.breakup(2020, [ a ])
      const entry = p.history.get({ tag: 'dissolved' })
      expect(entry[0].cheaters).toEqual([ a ])
    })
  })

  describe('runEncounters', () => {
    it('increases or decreases love scores', () => {
      const a = new Person()
      const b = new Person()
      const p = new Polycule(a, b)
      p.runEncounters()
      const possibilities = [ 0, 1, 2 ]
      expect(possibilities.includes(p.avg())).toEqual(true)
    })
  })

  describe('getOthers', () => {
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

  describe('getPolyculeMembers', () => {
    it('returns those people who are in the polycule', () => {
      const a = new Person()
      const b = new Person()
      const c = new Person()
      const p = new Polycule(a, b)
      expect(p.getPolyculeMembers([ a, b, c ])).toEqual([ a, b ])
    })

    it('preserves order', () => {
      const a = new Person()
      const b = new Person()
      const c = new Person()
      const p = new Polycule(a, b)
      expect(p.getPolyculeMembers([ a, b, c ])).not.toEqual([ b, a ])
    })

    it('returns an empty array if none of them are in the polycule', () => {
      const a = new Person()
      const b = new Person()
      const c = new Person()
      const p = new Polycule(a, b)
      expect(p.getPolyculeMembers([ c ])).toEqual([])
    })
  })

  describe('avg', () => {
    it('returns an average', () => {
      const a = new Person()
      const b = new Person()
      const c = new Person()
      const p = new Polycule(a, b, c)
      expect(p.avg()).toEqual(1)
    })

    it('can calculate what it would be like without someone', () => {
      const a = new Person()
      const b = new Person()
      const c = new Person()
      const p = new Polycule(a, b, c)
      p.love = [
        [ null, 1, 0 ],
        [ 1, null, 1 ],
        [ 2, 1, null ]
      ]
      const withC = p.avg()
      const withoutC = p.avg(c)
      expect(withC).toBeGreaterThan(withoutC)
    })

    it('returns null if there\'s only one person', () => {
      const p = new Person()
      const poly = new Polycule(p)
      expect(poly.avg()).toEqual(null)
    })
  })

  describe('getLoveBetween', () => {
    it('returns a love score between two people in the polycule', () => {
      const a = new Person()
      const b = new Person()
      const p = new Polycule(a, b)
      expect(typeof p.getLoveBetween(a, b)).toEqual('number')
    })

    it('returns null if given someone not in the polycule', () => {
      const a = new Person()
      const b = new Person()
      const c = new Person()
      const p = new Polycule(a, b)
      expect(p.getLoveBetween(a, c)).toEqual(null)
    })

    it('returns null if not given two people', () => {
      const a = new Person()
      const b = new Person()
      const p = new Polycule(a, b)
      expect(p.getLoveBetween(a, 'nope')).toEqual(null)
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

  describe('wantChild', () => {
    it('returns a boolean', () => {
      const m = new Community()
      const a = new Person()
      const b = new Person()
      const c = new Person()
      a.body.adjustFertility(false, 25)
      b.body.adjustFertility(false, 25)
      c.body.adjustFertility(false, 25)
      const p = new Polycule(a, b, c)
      expect(typeof p.wantChild(m, 2020)).toEqual('boolean')
    })
  })

  describe('haveChild', () => {
    it('returns a boolean', () => {
      const m = new Community()
      const a = new Person()
      const b = new Person()
      const c = new Person()
      const p = new Polycule(a, b, c)
      expect(typeof p.haveChild(m, 2020)).toEqual('boolean')
    })

    it('might create a child', () => {
      const m = new Community()
      const a = new Person()
      const b = new Person()
      const c = new Person()
      a.body.hasWomb = true; a.body.hasPenis = false; a.body.infertile = false; a.body.fertility = 100
      b.body.hasWomb = false; b.body.hasPenis = true; b.body.infertile = false; b.body.fertility = 100
      const p = new Polycule(a, b, c)
      p.haveChild(m, 2020)
      expect(p.children.length).toBeLessThanOrEqual(1)
    })

    it('marks the polycule as the child\'s parents', () => {
      const m = new Community()
      const a = new Person()
      const b = new Person()
      const c = new Person()
      a.body.hasWomb = true; a.body.hasPenis = false; a.body.infertile = false; a.body.fertility = 100
      b.body.hasWomb = false; b.body.hasPenis = true; b.body.infertile = false; b.body.fertility = 100
      const p = new Polycule(a, b, c)
      p.haveChild(m, 2020)
      expect(p.children.length === 0 || p.children[0].parents === p)
    })
  })
})
