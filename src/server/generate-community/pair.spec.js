/* global describe, it, expect */

import Community from './community'
import Pair from './pair'
import Person from './person'

describe('Pair', () => {
  describe('constructor', () => {
    it('returns false if not given two people', () => {
      const t1 = new Pair()
      const t2 = new Pair(1)
      const t3 = new Pair(1, 2)
      const p = new Person()
      const t4 = new Pair(p)
      const t5 = new Pair(p, 1)
      expect(!t1 && !t2 && !t3 && !t4 && !t5)
    })

    it('creates a new pair', () => {
      const p1 = new Person()
      const p2 = new Person()
      const pair = new Pair(p1, p2)
      expect(pair.constructor.name).toEqual('Pair')
    })

    it('provides a love score', () => {
      const p1 = new Person()
      const p2 = new Person()
      const pair = new Pair(p1, p2)
      expect(typeof pair.love).toEqual('number')
    })

    it('doesn\'t save if it\'s told not to', () => {
      const p1 = new Person()
      const p2 = new Person()
      const p = new Pair(p1, p2, false)
      const actual = typeof p.love === 'number' && p1.pairs === undefined && p2.pairs === undefined
      expect(actual)
    })
  })

  describe('save', () => {
    it('records the pairing for both persons', () => {
      const p1 = new Person()
      const p2 = new Person()
      const p = new Pair(p1, p2, false)
      p.save()
      expect(p1.pairs.length + p2.pairs.length).toEqual(2)
    })

    it('creates a symmetrical pair object', () => {
      const p1 = new Person()
      const p2 = new Person()
      const p = new Pair(p1, p2)
      p.save()
      p1.pairs[0].test = true
      expect(p2.pairs[0].test).toEqual(true)
    })

    it('can find out about partners', () => {
      const j = new Person()
      const r = new Person()
      j.name = 'Juliet'
      r.name = 'Romeo'
      const p = new Pair(j, r)
      p.save()
      const actual = j.pairs[0].name === 'Romeo' && r.pairs[0].name === 'Juliet'
      expect(actual)
    })
  })

  describe('form', () => {
    it('finds someone to form a pair with', () => {
      const community = new Community()
      const p = new Person()
      p.born = 1979
      p.sexuality.androphilia = 0.4
      p.sexuality.gynephilia = 0.4
      p.sexuality.skoliophilia = 0.2
      Pair.form(p, community, 2019)
      const t1 = p.pairs.length === 1
      const t2 = Object.keys(community.people).length === 2
      expect(t1 && t2)
    })
  })

  describe('getPartners', () => {
    it('returns an array of partners', () => {
      const community = new Community()
      const p = new Person()
      community.add(p)
      p.born = 1979
      p.sexuality.androphilia = 0.4
      p.sexuality.gynephilia = 0.4
      p.sexuality.skoliophilia = 0.2
      Pair.form(p, community, 2019)
      const partners = Pair.getPartners(p.pairs, p.id)
      const t1 = partners.length === 1
      const t2 = typeof partners[0] === 'Person'
      const t3 = (p.pairs[0].a.id === partners[0].id) || p.pairs[0].b.id === partners[0].id
      const t4 = (p.pairs[0].a.id === p.id) || (p.pairs[0].b.id === p.id)
      expect(t1 && t2 && t3 && t4)
    })
  })
})
