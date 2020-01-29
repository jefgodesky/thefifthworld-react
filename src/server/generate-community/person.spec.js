/* global describe, it, expect */

import Community from './community'
import Person from './person'

describe('Person', () => {
  describe('constructor', () => {
    it('creates a genotype', () => {
      const p = new Person()
      expect(p.genotype.constructor.name).toEqual('Body')
    })

    it('creates a body', () => {
      const p = new Person()
      expect(p.body.constructor.name).toEqual('Body')
    })

    it('creates a personality', () => {
      const p = new Person()
      expect(p.personality.constructor.name).toEqual('Personality')
    })

    it('creates a sexuality', () => {
      const p = new Person()
      expect(p.sexuality.constructor.name).toEqual('Sexuality')
    })

    it('assigns a gender', () => {
      const genders = [
        'Feminine woman', 'Woman', 'Masculine woman',
        'Third gender', 'Fifth gender',
        'Feminine man', 'Man', 'Masculine man'
      ]
      const p = new Person()
      expect(genders.includes(p.gender))
    })

    it('assigns intelligence', () => {
      const p = new Person()
      expect(typeof p.intelligence).toEqual('number')
    })

    it('determines neurodivergence', () => {
      const p = new Person()
      expect(typeof p.neurodivergent).toEqual('boolean')
    })

    it('establishes a present', () => {
      const p = new Person({ born: 2020 })
      expect(p.present).toEqual(2020)
    })

    it('includes infant mortality', () => {
      let infantMortality = 0
      for (let i = 0; i < 100; i++) {
        const mom = new Person()
        mom.genotype.hasWomb = true
        mom.genotype.hasPenis = false

        const dad = new Person()
        dad.genotype.hasWomb = false
        dad.genotype.hasPenis = true

        const baby = new Person({ parents: [ mom.genotype, dad.genotype ], born: 2020 })
        if (baby.died) infantMortality++
      }
      expect(infantMortality).toBeGreaterThan(0)
    })
  })

  describe('assignGender', () => {
    it('assigns a gender', () => {
      const genders = [ 'Woman', 'Third gender', 'Man' ]
      const p = new Person()
      p.gender = null
      p.assignGender()
      expect(genders.includes(p.gender))
    })

    it('assigns a gender in a four-gender system', () => {
      const genders = [
        'Feminine woman', 'Woman', 'Masculine woman',
        'Feminine man', 'Man', 'Masculine man'
      ]
      const p = new Person()
      p.gender = null
      p.assignGender(4)
      expect(genders.includes(p.gender))
    })

    it('assigns a gender in a five-gender system', () => {
      const genders = [
        'Feminine woman', 'Woman', 'Masculine woman', 'Fifth gender',
        'Feminine man', 'Man', 'Masculine man'
      ]
      const p = new Person()
      p.gender = null
      p.assignGender(4)
      expect(genders.includes(p.gender))
    })

    it('assigns a gender in a two-gender system', () => {
      const genders = [ 'Man', 'Woman' ]
      const p = new Person()
      p.gender = null
      p.assignGender(2)
      expect(genders.includes(p.gender))
    })
  })

  describe('die', () => {
    it('marks the character as dead', () => {
      const p = new Person()
      p.die()
      expect(p.died)
    })
  })

  describe('getAge', () => {
    it('calculates age based on the character\'s present', () => {
      const p = new Person({ born: 2020 })
      p.present = 2040
      expect(p.getAge()).toEqual(20)
    })

    it('calculates age based on the year provided', () => {
      const p = new Person({ born: 2020 })
      p.present = 2040
      expect(p.getAge(2030)).toEqual(10)
    })

    it('calculates age based on the year the character left', () => {
      const p = new Person({ born: 2020 })
      p.present = 2040
      p.left = 2035
      expect(p.getAge()).toEqual(15)
    })

    it('calculates age based on the year the character died', () => {
      const p = new Person({ born: 2020 })
      p.present = 2040
      p.died = 2035
      expect(p.getAge()).toEqual(15)
    })
  })

  describe('age', () => {
    it('increments the character\'s present', () => {
      const p = new Person({ born: 2020 })
      p.age()
      expect(p.present).toEqual(2021)
    })

    it('won\'t let you live more than 10 years beyond your longevity', () => {
      const p = new Person({ born: 2020 })
      p.body.longevity = 100
      for (let i = 0; i < 120; i++) p.age()
      expect(p.died)
    })
  })
})
