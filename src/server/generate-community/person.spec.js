/* global describe, it, expect */

import Body from './body'
import Community from './community'
import Genotype from './genotype'
import Person from './person'
import Personality from './personality'

import { daysFromNow, formatDate, between } from '../../shared/utils'

describe('Person', () => {
  describe('constructor', () => {
    it('sets a birth date', () => {
      const p = new Person()
      expect(p.born).toBeInstanceOf(Date)
    })

    it('defaults birth date to 144,000 days from today', () => {
      const p = new Person()
      const expected = formatDate(daysFromNow(144000))
      expect(formatDate(p.born)).toEqual(expected)
    })

    it('can take a birth year', () => {
      const p = new Person(2020)
      expect(p.born.getFullYear()).toEqual(2020)
    })

    it('establishes a present year', () => {
      const p = new Person(2020)
      expect(p.present).toEqual(2020)
    })

    it('can add the person to a community', () => {
      const c = new Community()
      const p = new Person(c)
      expect(c.people[p.id]).toEqual(p)
    })

    it('can take a single parent', () => {
      const c = new Community()
      const mother = new Person(c)
      mother.body.male = false; mother.body.female = true; mother.body.fertility = 100; mother.body.infertile = false
      const child = new Person(mother)
      expect(child.mother).toEqual(mother.id)
    })
  })

  describe('setGenes', () => {
    it('sets the genotype', () => {
      const p = new Person()
      p.setGenes()
      expect(p.genotype).toBeInstanceOf(Genotype)
    })

    it('sets the body', () => {
      const p = new Person()
      p.setGenes()
      expect(p.body).toBeInstanceOf(Body)
    })

    it('sets the personality', () => {
      const p = new Person()
      p.setGenes()
      expect(p.personality).toBeInstanceOf(Personality)
    })
  })

  describe('singleParent', () => {
    it('can take a single parent', () => {
      const parent = new Person()
      const child = new Person()
      child.singleParent(parent)
      expect(child).toBeInstanceOf(Person)
    })

    it('will assign values close to the parent\'s', () => {
      const parent = new Person()
      const child = new Person()
      child.singleParent(parent)
      const actual = child.personality.openness
      const min = parent.personality.openness - 0.1
      const max = parent.personality.openness + 0.1
      expect(between(actual, min, max)).toEqual(actual)
    })

    it('will tell you who your mother is', () => {
      const community = new Community()
      const parent = new Person(community)
      parent.body.male = false; parent.body.female = true; parent.body.fertility = 100; parent.body.infertile = false
      const child = new Person(community)
      child.singleParent(parent)
      expect(child.mother).toEqual(parent.id)
    })

    it('will tell you who your father is', () => {
      const community = new Community()
      const parent = new Person(community)
      parent.body.male = true; parent.body.female = false; parent.body.fertility = 100; parent.body.infertile = false
      const child = new Person(community)
      child.singleParent(parent)
      expect(child.father).toEqual(parent.id)
    })

    it('will make the parent the mother where it could go either way', () => {
      const community = new Community()
      const parent = new Person(community)
      parent.body.male = true; parent.body.female = true; parent.body.fertility = 100; parent.body.infertile = false
      const child = new Person(community)
      child.singleParent(parent)
      expect(child.mother).toEqual(parent.id)
    })
  })
})
