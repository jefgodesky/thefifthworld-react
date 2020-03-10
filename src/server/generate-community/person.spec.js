/* global describe, it, expect */

import Body from './body'
import Community from './community'
import Genotype from './genotype'
import Person from './person'
import Personality from './personality'

import { allTrue, daysFromNow, formatDate, between } from '../../shared/utils'

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

    it('adds an empty array of partners', () => {
      const p = new Person()
      expect(p.partners).toEqual([])
    })

    it('adds an empty array of children', () => {
      const p = new Person()
      expect(p.children).toEqual([])
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

    it('can take a single parent and adds the child to that parent\'s children', () => {
      const c = new Community()
      const mother = new Person(c)
      mother.body.male = false; mother.body.female = true; mother.body.fertility = 100; mother.body.infertile = false
      const child = new Person(mother, c)
      expect(mother.children).toContain(child.id)
    })

    it('can take several parents and sort out the mother and father', () => {
      const c = new Community()
      const mother = new Person(c)
      mother.body.male = false; mother.body.female = true; mother.body.fertility = 100; mother.body.infertile = false
      const father = new Person(c)
      father.body.male = true; father.body.female = false; father.body.fertility = 100; father.body.infertile = false
      const child = new Person(mother, father)
      expect(`${child.mother} ${child.father}`).toEqual(`${mother.id} ${father.id}`)
    })

    it('can take several parents and add the child to the father\'s children', () => {
      const c = new Community()
      const mother = new Person(c)
      mother.body.male = false; mother.body.female = true; mother.body.fertility = 100; mother.body.infertile = false
      const father = new Person(c)
      father.body.male = true; father.body.female = false; father.body.fertility = 100; father.body.infertile = false
      const child = new Person(mother, father, c)
      expect(`${child.mother} ${child.father}`).toEqual(`${mother.id} ${father.id}`)
    })

    it('can take parents, a community, and a birth year in any order', () => {
      const c = new Community()
      const mother = new Person(c)
      mother.body.male = false; mother.body.female = true; mother.body.fertility = 100; mother.body.infertile = false
      const father = new Person(c)
      father.body.male = true; father.body.female = false; father.body.fertility = 100; father.body.infertile = false
      const child = new Person(2020, mother, father, c)
      const tests = [
        child instanceof Person,
        child.mother === mother.id,
        child.father === father.id,
        child.born.getFullYear() === 2020,
        c.people[child.id] === child
      ]
      expect(allTrue(tests)).toEqual(true)
    })

    it('adds a birth record to the history', () => {
      const p = new Person()
      expect(p.history.get({ tag: 'born' })).toHaveLength(1)
    })

    it('assigns a gender', () => {
      const genders = [ 'Man', 'Woman', 'Third gender' ]
      const p = new Person()
      expect(genders).toContain(p.gender)
    })

    it('assigns a gender in a community with just two genders', () => {
      const genders = [ 'Man', 'Woman' ]
      const c = new Community({ traditions: { genders: 2 } })
      const p = new Person(c)
      expect(genders).toContain(p.gender)
    })

    it('assigns a gender in a community with four genders', () => {
      const genders = [ 'Masculine man', 'Feminine man', 'Masculine woman', 'Feminine woman' ]
      const c = new Community({ traditions: { genders: 4 } })
      const p = new Person(c)
      expect(genders).toContain(p.gender)
    })

    it('assigns a gender in a community with five genders', () => {
      const genders = [ 'Masculine man', 'Feminine man', 'Fifth gender', 'Masculine woman', 'Feminine woman' ]
      const c = new Community({ traditions: { genders: 5 } })
      const p = new Person(c)
      expect(genders).toContain(p.gender)
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

    it('sets intelligence', () => {
      const p = new Person()
      p.setGenes()
      expect(p.intelligence).not.toBeNaN()
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

  describe('birth', () => {
    it('picks a mother and father from an array', () => {
      const community = new Community()
      const mother = new Person(community)
      mother.body.male = false; mother.body.female = true; mother.body.fertility = 100; mother.body.infertile = false
      const father = new Person(community)
      father.body.male = true; father.body.female = false; father.body.fertility = 100; father.body.infertile = false
      const other = new Person(community)
      const child = new Person(community)
      child.birth(mother, father, other)
      expect(child.mother === mother.id && child.father === father.id).toEqual(true)
    })
  })

  describe('assignGender', () => {
    it('assigns a gender', () => {
      const genders = [ 'Woman', 'Third gender', 'Man' ]
      const p = new Person()
      p.gender = undefined
      p.assignGender()
      expect(genders).toContain(p.gender)
    })

    it('assigns a gender in a four-gender system', () => {
      const genders = [
        'Feminine woman', 'Woman', 'Masculine woman',
        'Feminine man', 'Man', 'Masculine man'
      ]
      const p = new Person()
      p.gender = null
      p.assignGender(4)
      expect(genders).toContain(p.gender)
    })

    it('assigns a gender in a five-gender system', () => {
      const genders = [
        'Feminine woman', 'Woman', 'Masculine woman', 'Fifth gender',
        'Feminine man', 'Man', 'Masculine man'
      ]
      const p = new Person()
      p.gender = null
      p.assignGender(4)
      expect(genders).toContain(p.gender)
    })

    it('assigns a gender in a two-gender system', () => {
      const genders = [ 'Man', 'Woman' ]
      const p = new Person()
      p.gender = null
      p.assignGender(2)
      expect(genders).toContain(p.gender)
    })
  })

  describe('assignAttraction', () => {
    it('assigns an attraction matrix', () => {
      const p = new Person()
      p.gender = 'Woman'
      p.assignAttraction()
      expect(p.attraction).toHaveLength(6)
    })

    it('assigns a value to physical attractiveness', () => {
      const p = new Person()
      p.gender = 'Woman'
      p.assignAttraction()
      expect(p.attraction.filter(e => e.event === 'attractiveness')[0].chance).not.toBeNaN()
    })

    it('assigns a value to openness to new experience', () => {
      const p = new Person()
      p.gender = 'Woman'
      p.assignAttraction()
      expect(p.attraction.filter(e => e.event === 'openness')[0].chance).not.toBeNaN()
    })

    it('assigns a value to conscientiousness', () => {
      const p = new Person()
      p.gender = 'Woman'
      p.assignAttraction()
      expect(p.attraction.filter(e => e.event === 'conscientiousness')[0].chance).not.toBeNaN()
    })

    it('assigns a value to extraversion', () => {
      const p = new Person()
      p.gender = 'Woman'
      p.assignAttraction()
      expect(p.attraction.filter(e => e.event === 'extraversion')[0].chance).not.toBeNaN()
    })

    it('assigns a value to agreeableness', () => {
      const p = new Person()
      p.gender = 'Woman'
      p.assignAttraction()
      expect(p.attraction.filter(e => e.event === 'agreeableness')[0].chance).not.toBeNaN()
    })

    it('assigns a value to neuroticism', () => {
      const p = new Person()
      p.gender = 'Woman'
      p.assignAttraction()
      expect(p.attraction.filter(e => e.event === 'neuroticism')[0].chance).not.toBeNaN()
    })
  })

  describe('getAge', () => {
    it('returns the character\'s current age', () => {
      const p = new Person(2005)
      p.present = 2020
      expect(p.getAge()).toEqual(15)
    })

    it('returns the character\'s age as of the given year', () => {
      const p = new Person(2005)
      p.present = 2020
      expect(p.getAge(2015)).toEqual(10)
    })

    it('returns the character\'s age as of the year she left', () => {
      const p = new Person(1979)
      p.present = 2000
      p.leave()
      expect(p.getAge(2020)).toEqual(21)
    })

    it('returns the character\'s age as of the year she died', () => {
      const p = new Person(1979)
      p.present = 2000
      p.die()
      expect(p.getAge(2020)).toEqual(21)
    })
  })

  describe('getSick', () => {
    it('adds an event to your personal history', () => {
      const p = new Person()
      p.getSick()
      expect(p.history.get({ tag: 'sickness' })).toHaveLength(1)
    })

    it('adds the given tags to the event', () => {
      const p = new Person()
      p.getSick([ 'test1', 'test2' ])
      const event = p.history.get({ tag: 'sickness' })[0]
      const tests = [
        event.tags.includes('test1'),
        event.tags.includes('test2')
      ]
      expect(allTrue(tests)).toEqual(true)
    })
  })

  describe('getHurt', () => {
    it('adds an event to your personal history', () => {
      const p = new Person()
      p.getHurt()
      expect(p.history.get({ tag: 'injury' })).toHaveLength(1)
    })

    it('adds the given tags to the event', () => {
      const p = new Person()
      p.getHurt([ 'test1', 'test2' ])
      const event = p.history.get({ tag: 'injury' })[0]
      const tests = [
        event.tags.includes('test1'),
        event.tags.includes('test2')
      ]
      expect(allTrue(tests)).toEqual(true)
    })
  })

  describe('encounter', () => {
    it('returns a boolean', () => {
      const a = new Person()
      const b = new Person()
      expect(typeof a.encounter(b)).toEqual('boolean')
    })

    it('returns true for two random people more than 25% of the time', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const a = new Person()
        const b = new Person()
        if (a.encounter(b)) count++
      }
      expect(count).toBeGreaterThan(25)
    })

    it('returns true for two random people less than 75% of the time', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const a = new Person()
        const b = new Person()
        if (a.encounter(b)) count++
      }
      expect(count).toBeLessThan(75)
    })

    it('returns true when the other person is exactly what you\'ve always wanted', () => {
      const a = new Person()
      const b = new Person()

      a.attraction = [
        { event: 'attractiveness', chance: 100 },
        { event: 'openness', chance: 0 },
        { event: 'conscientiousness', chance: 0 },
        { event: 'extraversion', chance: 0 },
        { event: 'agreeableness', chance: 0 },
        { event: 'neuroticism', chance: 0 }
      ]
      b.body.attractiveness = 100

      expect(a.encounter(b)).toEqual(true)
    })

    it('returns false when the other person is nothing like what you want', () => {
      const a = new Person()
      const b = new Person()

      a.attraction = [
        { event: 'attractiveness', chance: 100 },
        { event: 'openness', chance: 0 },
        { event: 'conscientiousness', chance: 0 },
        { event: 'extraversion', chance: 0 },
        { event: 'agreeableness', chance: 0 },
        { event: 'neuroticism', chance: 0 }
      ]
      b.body.attractiveness = -100

      expect(a.encounter(b)).toEqual(false)
    })
  })

  describe('isAttractedTo', () => {
    it('returns a boolean', () => {
      const a = new Person()
      const b = new Person()
      expect(typeof a.isAttractedTo(b)).toEqual('boolean')
    })

    it('sometimes returns true', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const a = new Person(1990)
        const b = new Person(1990)
        a.present = 2020; b.present = 2020
        if (a.isAttractedTo(b)) count++
      }
      expect(count).toBeGreaterThan(0)
    })

    it('returns true more than 25% of the time when a person matches your sexual preference', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const a = new Person(1990)
        a.present = 2020
        a.sexuality.androphilia = 10
        a.sexuality.gynephilia = 80
        a.sexuality.skoliophilia = 10
        const b = new Person(1990)
        b.present = 2020
        b.gender = 'Woman'
        if (a.isAttractedTo(b)) count++
      }
      expect(count).toBeGreaterThan(25)
    })

    it('returns true less than 75% of the time when a person matches your sexual preference', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const a = new Person(1990)
        a.present = 2020
        a.sexuality.androphilia = 10
        a.sexuality.gynephilia = 80
        a.sexuality.skoliophilia = 10
        const b = new Person(1990)
        b.present = 2020
        b.gender = 'Woman'
        if (a.isAttractedTo(b)) count++
      }
      expect(count).toBeLessThan(75)
    })
  })

  describe('isAppropriateAge', () => {
    it('returns true if given two people of appropriate age', () => {
      const p1 = new Person(2000)
      const p2 = new Person(2000)
      p1.present = 2020; p2.present = 2020
      expect(p1.isAppropriateAge(p2)).toEqual(true)
    })

    it('returns false if not given a person', () => {
      const p = new Person(2005)
      p.present = 2020
      expect(p.isAppropriateAge(42)).toEqual(false)
    })

    it('returns false if you\'re under 16', () => {
      const p1 = new Person(2005)
      const p2 = new Person(2000)
      p1.present = 2020; p2.present = 2020
      expect(p1.isAppropriateAge(p2)).toEqual(false)
    })

    it('returns false if she\'s under 16', () => {
      const p1 = new Person(2000)
      const p2 = new Person(2005)
      p1.present = 2020; p2.present = 2020
      expect(p1.isAppropriateAge(p2)).toEqual(false)
    })

    it('returns false if she\'s too young for you', () => {
      const p1 = new Person(1990)
      const p2 = new Person(2000)
      p1.present = 2020; p2.present = 2020
      expect(p1.isAppropriateAge(p2)).toEqual(false)
    })

    it('returns false if you\'re too young for her', () => {
      const p1 = new Person(2000)
      const p2 = new Person(1990)
      p1.present = 2020; p2.present = 2020
      expect(p1.isAppropriateAge(p2)).toEqual(false)
    })
  })

  describe('considerRelationship', () => {
    it('returns a boolean', () => {
      const c = new Community()
      const a = new Person(c)
      const b = new Person()
      expect(typeof a.considerRelationship(b)).toEqual('boolean')
    })

    it('results in a new relationship for compatible people more than 10% of the time', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const c = new Community()
        const a = new Person(c, 1990)
        a.present = 2020
        a.gender = 'Man'
        a.sexuality.androphilia = 5
        a.sexuality.gynephilia = 75
        a.sexuality.skoliophilia = 5

        const b = new Person(1990)
        b.present = 2020
        b.gender = 'Woman'
        b.sexuality.androphilia = 75
        b.sexuality.gynephilia = 5
        b.sexuality.skoliophilia = 5

        a.considerRelationship(b, c)
        if (a.partners.length > 0) count++
      }
      expect(count).toBeGreaterThan(10)
    })

    it('results in a new relationship for compatible people less than 60% of the time', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const c = new Community()
        const a = new Person(c, 1990)
        a.present = 2020
        a.gender = 'Man'
        a.sexuality.androphilia = 5
        a.sexuality.gynephilia = 75
        a.sexuality.skoliophilia = 5

        const b = new Person(1990)
        b.present = 2020
        b.gender = 'Woman'
        b.sexuality.androphilia = 75
        b.sexuality.gynephilia = 5
        b.sexuality.skoliophilia = 5

        a.considerRelationship(b, c)
        if (a.partners.length > 0) count++
      }
      expect(count).toBeLessThan(60)
    })
  })

  describe('takePartner', () => {
    it('adds your new partner to your list', () => {
      const c = new Community()
      const a = new Person(c)
      const b = new Person()
      a.takePartner(b, c)
      expect(a.partners).toHaveLength(1)
    })

    it('adds you to your new partner\'s list', () => {
      const c = new Community()
      const a = new Person(c)
      const b = new Person()
      a.takePartner(b, c)
      expect(b.partners).toHaveLength(1)
    })

    it('gives you an ID', () => {
      const c = new Community()
      const a = new Person()
      const b = new Person()
      a.takePartner(b, c)
      expect(a.id).toBeDefined()
    })

    it('gives your partner an ID', () => {
      const c = new Community()
      const a = new Person()
      const b = new Person()
      a.takePartner(b, c)
      expect(b.id).toBeDefined()
    })

    it('adds you to the community', () => {
      const c = new Community()
      const a = new Person()
      const b = new Person()
      a.takePartner(b, c)
      expect(c.isCurrentMember(a)).toEqual(true)
    })

    it('adds your partner to the community', () => {
      const c = new Community()
      const a = new Person()
      const b = new Person()
      a.takePartner(b, c)
      expect(c.isCurrentMember(b)).toEqual(true)
    })

    it('lists your partner\'s ID', () => {
      const c = new Community()
      const a = new Person()
      const b = new Person()
      a.takePartner(b, c)
      expect(a.partners[0].id).toEqual(b.id)
    })

    it('lists your ID for your partner', () => {
      const c = new Community()
      const a = new Person()
      const b = new Person()
      a.takePartner(b, c)
      expect(b.partners[0].id).toEqual(a.id)
    })

    it('sets an exclusivity flag for you', () => {
      const c = new Community()
      const a = new Person()
      const b = new Person()
      a.takePartner(b, c)
      expect(typeof a.partners[0].exclusive).toEqual('boolean')
    })

    it('sets an exclusivity flag for your partner', () => {
      const c = new Community()
      const a = new Person()
      const b = new Person()
      a.takePartner(b, c)
      expect(typeof b.partners[0].exclusive).toEqual('boolean')
    })

    it('sets the same exclusivity flag for you and your partner', () => {
      const c = new Community()
      const a = new Person()
      const b = new Person()
      a.takePartner(b, c)
      expect(a.partners[0].exclusive).toEqual(b.partners[0].exclusive)
    })

    it('will let you specify exclusivity', () => {
      const c = new Community()
      const a = new Person()
      const b = new Person()
      a.takePartner(b, c, true)
      expect(a.partners[0].exclusive && b.partners[0].exclusive).toEqual(true)
    })

    it('is exclusive more than 75% of the time if that\'s the community\'s tradition', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const c = new Community({ traditions: { monogamy: 1 } })
        const a = new Person()
        const b = new Person()
        a.takePartner(b, c)
        if (a.partners[0].exclusive) count++
      }
      expect(count).toBeGreaterThan(75)
    })

    it('is exclusive less than 100% of the time even if that is the community\'s tradition', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const c = new Community({ traditions: { monogamy: 1 } })
        const a = new Person()
        const b = new Person()
        a.takePartner(b, c)
        if (a.partners[0].exclusive) count++
      }
      expect(count).toBeLessThan(100)
    })

    it('is exclusive more than 50% of the time if that isn\'t the community\'s tradition', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const c = new Community({ traditions: { monogamy: 0 } })
        const a = new Person()
        const b = new Person()
        a.takePartner(b, c)
        if (a.partners[0].exclusive) count++
      }
      expect(count).toBeGreaterThan(50)
    })

    it('is exclusive less than 95% of the time if that isn\'t the community\'s tradition', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const c = new Community({ traditions: { monogamy: 0 } })
        const a = new Person()
        const b = new Person()
        a.takePartner(b, c)
        if (a.partners[0].exclusive) count++
      }
      expect(count).toBeLessThan(95)
    })

    it('sets your initial love score', () => {
      const c = new Community()
      const a = new Person()
      const b = new Person()
      a.takePartner(b, c)
      expect(a.partners[0].love).toEqual(1)
    })

    it('sets your partner\'s initial love score', () => {
      const c = new Community()
      const a = new Person()
      const b = new Person()
      a.takePartner(b, c)
      expect(b.partners[0].love).toEqual(1)
    })

    it('adds your new relationship to your history', () => {
      const c = new Community()
      const a = new Person()
      const b = new Person()
      a.takePartner(b, c)
      expect(a.history.get({ tag: 'new relationship' })).toHaveLength(1)
    })

    it('adds the people in your new relationship to your history', () => {
      const c = new Community()
      const a = new Person()
      const b = new Person()
      a.takePartner(b, c)
      expect(a.history.get({ tag: 'new relationship' })[0].parties).toEqual([ a.id, b.id ])
    })

    it('adds your new relationship to your partner\'s history', () => {
      const c = new Community()
      const a = new Person()
      const b = new Person()
      a.takePartner(b, c)
      expect(b.history.get({ tag: 'new relationship' })).toHaveLength(1)
    })

    it('adds the people in your new relationship to your partner\'s history', () => {
      const c = new Community()
      const a = new Person()
      const b = new Person()
      a.takePartner(b, c)
      expect(b.history.get({ tag: 'new relationship' })[0].parties).toEqual([ a.id, b.id ])
    })
  })

  describe('considerSeparation', () => {
    it('returns false for a new relationship', () => {
      const c = new Community()
      const a = new Person(c)
      const b = new Person()
      a.takePartner(b, c)
      expect(a.considerSeparation(b)).toEqual(false)
    })

    it('returns false if you\'re not in a relationship', () => {
      const c = new Community()
      const a = new Person(c)
      const b = new Person()
      expect(a.considerSeparation(b)).toEqual(false)
    })

    it('returns true more often when you\'re less agreeable', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const c = new Community()
        const a = new Person()
        a.personality.agreeableness = -1
        const b = new Person()
        a.takePartner(b, c)
        a.partners[0].love = -1
        if (a.considerSeparation(b)) count++
      }
      expect(count).toBeGreaterThan(25)
    })

    it('returns true more often if you don\'t love the other person', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const c = new Community()
        const a = new Person()
        const b = new Person()
        a.takePartner(b, c)
        a.partners[0].love = -10
        if (a.considerSeparation(b)) count++
      }
      expect(count).toBeGreaterThan(25)
    })
  })

  describe('separate', () => {
    it('removes the partner from your list', () => {
      const c = new Community()
      const a = new Person()
      const b = new Person()
      a.takePartner(b, c)
      a.separate(b)
      expect(a.partners).toHaveLength(0)
    })

    it('removes you from your partner\'s list', () => {
      const c = new Community()
      const a = new Person()
      const b = new Person()
      a.takePartner(b, c)
      a.separate(b)
      expect(b.partners).toHaveLength(0)
    })

    it('notes the separation in your history', () => {
      const c = new Community()
      const a = new Person()
      const b = new Person()
      a.takePartner(b, c)
      a.separate(b)
      expect(a.history.get({ tag: 'separation' })).toHaveLength(1)
    })

    it('notes who separated in your history', () => {
      const c = new Community()
      const a = new Person()
      const b = new Person()
      a.takePartner(b, c)
      a.separate(b)
      expect(a.history.get({ tag: 'separation' })[0].separated).toEqual([ a.id, b.id ])
    })

    it('notes the separation in your former partner\'s history', () => {
      const c = new Community()
      const a = new Person()
      const b = new Person()
      a.takePartner(b, c)
      a.separate(b)
      expect(b.history.get({ tag: 'separation' })).toHaveLength(1)
    })

    it('notes who separated in your former partner\'s history', () => {
      const c = new Community()
      const a = new Person()
      const b = new Person()
      a.takePartner(b, c)
      a.separate(b)
      expect(b.history.get({ tag: 'separation' })[0].separated).toEqual([ a.id, b.id ])
    })
  })

  describe('developRelationships', () => {
    it('changes your love score', () => {
      const c = new Community()
      const a = new Person()
      const b = new Person()
      a.takePartner(b, c)
      a.developRelationships(c)
      expect(a.partners[0].love).not.toEqual(1)
    })
  })

  describe('getPartners', () => {
    it('returns an array of your partners', () => {
      const community = new Community()
      const self = new Person()
      const a = new Person()
      self.takePartner(a, community)
      const b = new Person()
      self.takePartner(b, community)
      const c = new Person()
      self.takePartner(c, community)
      expect(self.getPartners(community)).toEqual([ a, b, c ])
    })

    it('doesn\'t include partners who have left', () => {
      const community = new Community()
      const self = new Person()
      const a = new Person()
      self.takePartner(a, community)
      const b = new Person()
      self.takePartner(b, community)
      const c = new Person()
      self.takePartner(c, community)
      c.leave()
      expect(self.getPartners(community)).toEqual([ a, b ])
    })

    it('doesn\'t include partners who have died', () => {
      const community = new Community()
      const self = new Person()
      const a = new Person()
      self.takePartner(a, community)
      const b = new Person()
      self.takePartner(b, community)
      const c = new Person()
      self.takePartner(c, community)
      c.die()
      expect(self.getPartners(community)).toEqual([ a, b ])
    })
  })

  describe('isAvailable', () => {
    it('returns true if you don\'t have any partners', () => {
      const community = new Community()
      const self = new Person(community)
      expect(self.isAvailable()).toEqual(true)
    })

    it('returns true if all of your relationships are non-exclusive', () => {
      const community = new Community()
      community.traditions.monogamy = 0
      const self = new Person(community)
      const a = new Person()
      self.takePartner(a, community, false)
      const b = new Person()
      self.takePartner(b, community, false)
      const c = new Person()
      self.takePartner(c, community, false)
      expect(self.isAvailable()).toEqual(true)
    })

    it('returns false if any of your relationships are exclusive', () => {
      const community = new Community()
      const self = new Person(community)
      const a = new Person()
      self.takePartner(a, community, false)
      const b = new Person()
      self.takePartner(b, community, false)
      const c = new Person()
      self.takePartner(c, community, true)
      expect(self.isAvailable()).toEqual(false)
    })

    it('returns true for a second relationship more than 0% of the time under starting conditions', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const community = new Community()
        const self = new Person(community)
        const a = new Person()
        self.takePartner(a, community, false)
        if (self.isAvailable(community)) count++
      }
      expect(count).toBeGreaterThan(0)
    })

    it('returns true for a second relationship less than 20% of the time under starting conditions', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const community = new Community()
        const self = new Person(community)
        const a = new Person()
        self.takePartner(a, community, false)
        if (self.isAvailable(community)) count++
      }
      expect(count).toBeLessThan(20)
    })

    it('returns true for a second relationship if you are very disagreeable', () => {
      const community = new Community()
      const self = new Person(community)
      self.personality.agreeableness = -2
      const a = new Person()
      self.takePartner(a, community, false)
      expect(self.isAvailable(community)).toEqual(true)
    })
  })

  describe('willingToCheat', () => {
    it('returns a boolean', () => {
      const p = new Person()
      expect(typeof p.willingToCheat()).toEqual('boolean')
    })

    it('returns true if you don\'t have any partners', () => {
      const p = new Person()
      expect(p.willingToCheat()).toEqual(true)
    })

    it('returns true more than 10% of the time', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const community = new Community()
        const self = new Person(community)
        const partner = new Person()
        self.takePartner(partner, community, true)
        if (self.willingToCheat()) count++
      }
      expect(count).toBeGreaterThan(10)
    })

    it('returns true less than 35% of the time', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const community = new Community()
        const self = new Person(community)
        const partner = new Person()
        self.takePartner(partner, community, true)
        if (self.willingToCheat()) count++
      }
      expect(count).toBeLessThan(35)
    })

    it('returns true less often if you\'re more deeply in love', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const community = new Community()
        const self = new Person(community)
        const partner = new Person()
        self.takePartner(partner, community, true)
        self.partners[0].love = 10
        if (self.willingToCheat()) count++
      }
      expect(count).toBeLessThan(15)
    })

    it('returns true less often if you\'re more agreeable', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const community = new Community()
        const self = new Person(community)
        self.personality.agreeableness = 1
        const partner = new Person()
        self.takePartner(partner, community, true)
        if (self.willingToCheat()) count++
      }
      expect(count).toBeLessThan(15)
    })
  })

  describe('feelSecure', () => {
    it('returns a boolean', () => {
      const c = new Community()
      const p = new Person(c)
      expect(typeof p.feelSecure(c)).toEqual('boolean')
    })

    it('returns true if the community hasn\'t had any problems recently', () => {
      const c = new Community()
      const p = new Person(c)
      expect(p.feelSecure(c)).toEqual(true)
    })
  })

  describe('considerChildren', () => {
    it('returns false if you don\'t have any partners', () => {
      const c = new Community()
      const p = new Person(c)
      expect(p.considerChildren(c)).toEqual(false)
    })

    it('returns false if you already have four children', () => {
      const community = new Community()
      const a = new Person(community)
      const b = new Person()
      a.takePartner(b, community)
      const c = new Person(community)
      const d = new Person(community)
      const e = new Person(community)
      const f = new Person(community)
      a.children = [ c.id, d.id, e.id, f.id ]
      expect(a.considerChildren(community)).toEqual(false)
    })

    it('returns true more often if you\'re very extraverted', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const c = new Community()
        const a = new Person(c)
        a.personality.extraversion = 1
        const b = new Person()
        a.takePartner(b, c)
        if (a.considerChildren(c)) count++
      }
      expect(count).toBeGreaterThan(50)
    })

    it('returns true more often if you\'re very open to new experience', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const c = new Community()
        const a = new Person(c)
        a.personality.openness = 1
        const b = new Person()
        a.takePartner(b, c)
        if (a.considerChildren(c)) count++
      }
      expect(count).toBeGreaterThan(50)
    })

    it('returns true more often if you\'re very emotionally stable', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const c = new Community()
        const a = new Person(c)
        a.personality.neuroticism = -1
        const b = new Person()
        a.takePartner(b, c)
        if (a.considerChildren(c)) count++
      }
      expect(count).toBeGreaterThan(50)
    })
  })

  describe('tryToConceive', () => {
    it('returns true if you have two perfectly fertile parents', () => {
      const a = new Person()
      a.body.female = true
      a.body.male = false
      a.body.infertile = false
      a.body.fertility = 100

      const b = new Person()
      b.body.female = false
      b.body.male = true
      b.body.infertile = false
      b.body.fertility = 100

      expect(a.tryToConceive(b)).toEqual(true)
    })

    it('returns false if not given a male and a female', () => {
      const a = new Person()
      a.body.female = true
      a.body.male = false
      a.body.infertile = false
      a.body.fertility = 100

      const b = new Person()
      b.body.female = true
      b.body.male = false
      b.body.infertile = false
      b.body.fertility = 100

      expect(a.tryToConceive(b)).toEqual(false)
    })

    it('returns false if given an infertile mother', () => {
      const a = new Person()
      a.body.female = true
      a.body.male = false
      a.body.infertile = true
      a.body.fertility = 100

      const b = new Person()
      b.body.female = false
      b.body.male = true
      b.body.infertile = false
      b.body.fertility = 100

      expect(a.tryToConceive(b)).toEqual(false)
    })

    it('returns false if given an infertile father', () => {
      const a = new Person()
      a.body.female = true
      a.body.male = false
      a.body.infertile = false
      a.body.fertility = 100

      const b = new Person()
      b.body.female = false
      b.body.male = true
      b.body.infertile = true
      b.body.fertility = 100

      expect(a.tryToConceive(b)).toEqual(false)
    })

    it('returns true no more than 15% more than the lowest fertility', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const a = new Person()
        a.body.female = true
        a.body.male = false
        a.body.infertile = false
        a.body.fertility = 60

        const b = new Person()
        b.body.female = false
        b.body.male = true
        b.body.infertile = false
        b.body.fertility = 40

        if (a.tryToConceive(b)) count++
      }
      expect(count).toBeLessThan(55)
    })

    it('returns true no less than 15% less than the lowest fertility', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const a = new Person()
        a.body.female = true
        a.body.male = false
        a.body.infertile = false
        a.body.fertility = 60

        const b = new Person()
        b.body.female = false
        b.body.male = true
        b.body.infertile = false
        b.body.fertility = 40

        if (a.tryToConceive(b)) count++
      }
      expect(count).toBeGreaterThan(25)
    })
  })

  describe('conceive', () => {
    it('produces a child', () => {
      const c = new Community()
      const a = new Person(c)
      const b = new Person()
      a.conceive(b, c)
      expect(a.children.length).toBeGreaterThan(0)
    })

    it('sometimes results in stillbirth', () => {
      let count = 0
      for (let i = 0; i < 1000; i++) {
        const c = new Community()
        const a = new Person(c)
        const b = new Person()
        a.conceive(b, c)
        const children = a.children.map(id => c.people[id])
        if (children.filter(c => c.died).length > 0) count++
      }
      expect(count).toBeGreaterThan(0)
    })

    it('rarely produces multiple children born at once', () => {
      let count = 0
      for (let i = 0; i < 2000; i++) {
        const c = new Community()
        const a = new Person(c)
        const b = new Person()
        a.conceive(b, c)
        if (a.children.length > 1) count++
      }
      expect(count).toBeGreaterThan(0)
    })

    it('records your child\'s birth in your personal history', () => {
      const c = new Community()
      const a = new Person(c)
      const b = new Person()
      a.conceive(b, c)
      expect(a.history.get({ tag: 'birth' })).toHaveLength(1)
    })

    it('records your child\'s birth in your partner\'s personal history', () => {
      const c = new Community()
      const a = new Person(c)
      const b = new Person()
      a.conceive(b, c)
      expect(b.history.get({ tag: 'birth' })).toHaveLength(1)
    })

    it('records your child\'s birth in your child\'s personal history', () => {
      const c = new Community()
      const a = new Person(c)
      const b = new Person()
      a.conceive(b, c)
      const child = c.people[a.children[0]]
      expect(child.history.get({ tag: 'birth' })).toHaveLength(1)
    })
  })

  describe('commitCrime', () => {
    it('does nothing if you\'re not antisocial', () => {
      const community = new Community()
      const a = new Person(community)
      a.personality.agreeableness = 0; a.personality.diagnose()
      const before = a.history.record.length
      a.commitCrime(community)
      expect(a.history.record.length).toEqual(before)
    })

    it('prompts an antisocial person to commit an act of sabotage by 25', () => {
      const community = new Community()
      community.territory = { yield: 10 }
      const a = new Person(community, 1990)
      a.present = 2020; a.personality.agreeableness = -3; a.personality.diagnose()
      a.commitCrime(community)
      expect(a.history.get({ tag: 'sabotage' })).toHaveLength(1)
    })
  })

  describe('ageBody', () => {
    it('introduces death from old age', () => {
      const p = new Person(1900)
      p.body.longevity = 90
      p.present = 2020
      p.ageBody()
      expect(p.died).toEqual(2020)
    })

    it('records when you die of old age', () => {
      const p = new Person(1900)
      p.body.longevity = 90
      p.present = 2020
      p.ageBody()
      const entry = p.history.get({ tag: 'died' })[0]
      expect(entry).toEqual({ year: 2020, tags: [ 'died' ], cause: 'natural' })
    })
  })

  describe('age', () => {
    it('increments the person\'s present', () => {
      const p = new Person()
      const before = p.present
      p.age()
      expect(p.present).toEqual(before + 1)
    })

    it('develops the person\'s relationships', () => {
      const c = new Community()
      const a = new Person(c)
      const b = new Person(c)
      a.takePartner(b, c)
      a.age(c)
      expect(a.partners[0].love).not.toEqual(1)
    })

    it('sometimes starts a relationship', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const c = new Community()
        const a = new Person(c, 2000)
        a.present = 2020
        c.generateStrangers()
        a.age(c)
        if (a.partners.length > 0) count++
      }
      expect(count).toBeGreaterThan(0)
    })

    it('develops skills if you\'re old enough and nothing else happened', () => {
      const c = new Community()
      const a = new Person(c, 1990)
      a.present = 2020
      a.age(c)
      const wasNotQuiet = !a.history.wasQuiet(2021)
      const developedSkills = a.skills.learning.skill !== undefined
      expect(wasNotQuiet || developedSkills).toEqual(true)
    })
  })

  describe('leave', () => {
    it('sets the year you left', () => {
      const p = new Person()
      p.leave()
      expect(p.left).not.toBeNaN()
    })

    it('returns an event report', () => {
      const p = new Person()
      const report = p.leave()
      expect(report.tags).toContain('left')
    })

    it('adds on to an existing report', () => {
      const p = new Person()
      const event = { tags: [ 'before' ] }
      const report = p.leave(event)
      expect(report.tags).toEqual([ 'before', 'left' ])
    })
  })

  describe('die', () => {
    it('sets the year of death', () => {
      const p = new Person()
      p.die()
      expect(p.died).not.toBeNaN()
    })

    it('returns an event report', () => {
      const p = new Person()
      const report = p.die()
      expect(report.tags).toContain('died')
    })

    it('notes the cause of death', () => {
      const p = new Person()
      const report = p.die('JS bugs')
      expect(report.cause).toEqual('JS bugs')
    })

    it('notes the ID of the killer if given a Person', () => {
      const c = new Community()
      const p = new Person()
      const k = new Person(c)
      const report = p.die('JS bugs', k)
      expect(report.killer).toEqual(k.id)
    })

    it('notes the killer\'s ID if it is given', () => {
      const p = new Person()
      const report = p.die('JS bugs', 'killer key')
      expect(report.killer).toEqual('killer key')
    })

    it('doesn\'t mention a killer if not given a Person or a string', () => {
      const p = new Person()
      const report = p.die('JS bugs', 5)
      expect(report.killer).not.toBeDefined()
    })

    it('doesn\'t mention a killer if nothing is given', () => {
      const p = new Person()
      const report = p.die('JS bugs')
      expect(report.killer).not.toBeDefined()
    })
  })
})
