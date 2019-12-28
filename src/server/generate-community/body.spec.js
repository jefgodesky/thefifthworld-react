/* global describe, it, expect */

import Body from './body'

describe('Body', () => {
  describe('constructor', () => {
    it('assigns a birth year', () => {
      const b = new Body({ born: 2019 })
      expect(b.born).toEqual(2019)
    })

    it('doesn\'t assign a birth year if it isn\'t given a year', () => {
      const b = new Body({ born: 'nope' })
      expect(b.born).toEqual(undefined)
    })

    it('assigns a body type', () => {
      const b = new Body()
      expect(typeof b.type).toEqual('number')
    })

    it('assigns a maximum longevity', () => {
      const b = new Body()
      expect(b.longevity).toBeGreaterThan(50)
    })

    it('determines if both eyes can see', () => {
      const b = new Body()
      const actual = [
        b.eyes.left === 'Blind' || b.eyes.left === 'Healthy',
        b.eyes.right === 'Blind' || b.eyes.right === 'Healthy'
      ].reduce((acc, curr) => acc && curr, true)
      expect(actual)
    })

    it('determines if both ears can hear', () => {
      const b = new Body()
      const actual = [
        b.ears.left === 'Deaf' || b.ears.left === 'Healthy',
        b.ears.right === 'Deaf' || b.ears.right === 'Healthy'
      ].reduce((acc, curr) => acc && curr, true)
      expect(actual)
    })

    it('determines if both arms are healthy', () => {
      const b = new Body()
      const actual = [
        b.arms.left === 'Disabled' || b.arms.left === 'Healthy',
        b.arms.right === 'Disabled' || b.arms.right === 'Healthy'
      ].reduce((acc, curr) => acc && curr, true)
      expect(actual)
    })

    it('determines if both legs are healthy', () => {
      const b = new Body()
      const actual = [
        b.legs.left === 'Disabled' || b.legs.left === 'Healthy',
        b.legs.right === 'Disabled' || b.legs.right === 'Healthy'
      ].reduce((acc, curr) => acc && curr, true)
      expect(actual)
    })

    it('sets achondroplasia', () => {
      const b = new Body()
      expect(typeof b.achondroplasia).toEqual('boolean')
    })

    it('sets whether or not this body can reproduce sexually as a male', () => {
      const b = new Body()
      expect(typeof b.hasPenis).toEqual('boolean')
    })

    it('sets whether or not this body can reproduce sexually as a female', () => {
      const b = new Body()
      expect(typeof b.hasWomb).toEqual('boolean')
    })

    it('sets a fertility score', () => {
      const b = new Body()
      expect(b.fertility).toEqual(0)
    })

    it('determines if this person is a psychopath', () => {
      const ppl = []
      for (let i = 0; i < 1000; i++) {
        const b = new Body()
        ppl.push(b)
      }
      const psychopaths = ppl.filter(p => p.psychopath)
      const actual = [
        psychopaths.length > 0,
        psychopaths.length < 20
      ].reduce((acc, curr) => acc && curr, 0)
      expect(actual)
    })

    it('can record scars', () => {
      const b = new Body()
      const { scars } = b
      expect(scars && Array.isArray(scars) && scars.length === 0)
    })

    it('can have a specified gender', () => {
      const b = new Body({ specifiedGender: 'Man' })
      const actual = [
        typeof b.hasPenis === 'boolean',
        typeof b.hasWomb === 'boolean'
      ].reduce((acc, curr) => acc && curr, true)
      expect(actual)
    })

    it('can make a copy', () => {
      const b = new Body()
      const c = new Body({ copy: b })
      const actual = [
        c.constructor.name === 'Body',
        c.type === b.type,
        typeof c.getAge === 'function'
      ].reduce((acc, curr) => acc && curr, true)
      expect(actual)
    })
  })

  describe('makeBaby', () => {
    it('creates a baby', () => {
      const mama = new Body()
      mama.hasWomb = true
      const papa = new Body()
      papa.hasPenis = true
      const baby = Body.makeBaby([ mama, papa ])
      expect(baby.constructor.name).toEqual('Body')
    })

    it('requires two parents', () => {
      const baby = Body.makeBaby()
      expect(baby).toEqual(undefined)
    })

    it('accepts parents with matching bits', () => {
      const p1 = new Body()
      p1.hasPenis = false
      p1.hasWomb = true

      const p2 = new Body()
      p2.hasPenis = false
      p2.hasWomb = true

      const baby = Body.makeBaby([ p1, p2 ])
      expect(baby).toEqual(undefined)
    })

    it('returns a baby with a body type between its mother and father', () => {
      const mama = new Body()
      mama.type = 0
      mama.hasPenis = false
      mama.hasWomb = true

      const papa = new Body()
      papa.type = 1
      papa.hasPenis = true
      papa.hasWomb = false

      const baby = Body.makeBaby([ mama, papa ])
      const actual = [
        baby.type >= 0,
        baby.type <= 1
      ].reduce((acc, curr) => acc && curr, true)
      expect(actual)
    })

    it('returns a baby with a maximum longevity between its mother and father', () => {
      const mama = new Body()
      mama.longevity = 80
      mama.hasPenis = false
      mama.hasWomb = true

      const papa = new Body()
      papa.longevity = 70
      papa.hasPenis = true
      papa.hasWomb = false

      const baby = Body.makeBaby([ mama, papa ])
      const actual = [
        baby.longevity >= 70,
        baby.longevity <= 80
      ].reduce((acc, curr) => acc && curr, true)
      expect(actual)
    })

    it('can use the constructor', () => {
      const mama = new Body()
      mama.hasPenis = false
      mama.hasWomb = true

      const papa = new Body()
      papa.hasPenis = true
      papa.hasWomb = false

      const baby = new Body({ parents: [ mama, papa ] })
      expect(baby.constructor.name).toEqual('Body')
    })

    it('assigns the birth year', () => {
      const p1 = new Body()
      p1.hasPenis = false
      p1.hasWomb = true

      const p2 = new Body()
      p2.hasPenis = true
      p2.hasWomb = false

      const baby = Body.makeBaby([ p1, p2 ], 2019)
      expect(baby.born).toEqual(2019)
    })

    it('doesn\'t assign the birth year if it isn\'t given a number', () => {
      const p1 = new Body()
      p1.hasPenis = false
      p1.hasWomb = true

      const p2 = new Body()
      p2.hasPenis = true
      p2.hasWomb = false

      const baby = Body.makeBaby([ p1, p2 ], 'nope')
      expect(baby.born).toEqual(undefined)
    })
  })

  describe('getAge', () => {
    it('reports age', () => {
      const b = new Body({ born: 1979 })
      expect(b.getAge(2019)).toEqual(40)
    })

    it('reports age at death if asking after she died', () => {
      const b = new Body({ born: 1979 })
      b.died = 2009
      expect(b.getAge(2019)).toEqual(30)
    })

    it('reports a negative number if it\'s before her birth', () => {
      const b = new Body({ born: 1979 })
      expect(b.getAge(1969)).toEqual(-10)
    })

    it('returns undefined if she has no birth year recorded', () => {
      const b = new Body()
      expect(b.getAge(2019)).toEqual(undefined)
    })

    it('returns undefined if an invalid year is given', () => {
      const b = new Body({ born: 1979 })
      expect(b.getAge('today')).toEqual(undefined)
    })
  })

  describe('isFertile', () => {
    it('returns false given an infertile person', () => {
      const b = new Body({ born: 1979 })
      b.makeInfertile()
      expect(b.isFertile()).toEqual(false)
    })

    it('returns false given a fertile person', () => {
      const b = new Body({ born: 1979 })
      b.fertility = 100
      b.infertile = false
      expect(b.isFertile()).toEqual(true)
    })

    it('returns false if given a fertile female, if asked for a fertile male', () => {
      const b = new Body({ born: 1979 })
      b.hasWomb = true
      b.hasPenis = false
      b.fertility = 100
      b.infertile = false
      expect(b.isFertile('Male')).toEqual(false)
    })

    it('returns true if given a fertile female, if asked for a fertile female', () => {
      const b = new Body({ born: 1979 })
      b.hasWomb = true
      b.hasPenis = false
      b.fertility = 100
      b.infertile = false
      expect(b.isFertile('Female')).toEqual(true)
    })

    it('returns false if given a fertile male, if asked for a fertile female', () => {
      const b = new Body({ born: 1979 })
      b.hasWomb = false
      b.hasPenis = true
      b.fertility = 100
      expect(b.isFertile('Female')).toEqual(false)
    })

    it('returns true if given a fertile male, if asked for a fertile male', () => {
      const b = new Body({ born: 1979 })
      b.hasWomb = false
      b.hasPenis = true
      b.fertility = 100
      b.infertile = false
      expect(b.isFertile('Male')).toEqual(true)
    })
  })

  describe('adjustFertility', () => {
    it('sets fertility to zero if you\'re 16 or younger', () => {
      const b = new Body()
      b.adjustFertility(false, 16)
      expect(b.fertility).toEqual(0)
    })

    it('peaks at age 20', () => {
      const b = new Body()
      b.fertility = 90
      b.infertile = false
      b.adjustFertility(false, 20)
      expect(b.fertility).toEqual(100)
    })

    it('goes down after 20', () => {
      const b = new Body()
      b.fertility = 100
      b.infertile = false
      b.adjustFertility(false, 20)
      const before = b.fertility
      b.adjustFertility(false, 25)
      expect(b.fertility).toBeLessThan(before)
    })

    it('drops below 50% for a female at age 45', () => {
      const b = new Body()
      b.hasWomb = true
      b.hasPenis = false
      b.fertility = 100
      b.infertile = false
      b.adjustFertility(false, 45)
      expect(b.fertility).toBeLessThan(50)
    })

    it('drops below 50% for a male at age 56', () => {
      const b = new Body()
      b.hasWomb = false
      b.hasPenis = true
      b.fertility = 100
      b.infertile = false
      b.adjustFertility(false, 56)
      expect(b.fertility).toBeLessThan(50)
    })

    it('adds 20% up to the maximum in times of peace and plenty', () => {
      const b = new Body()
      b.fertility = 0
      b.infertile = false
      b.adjustFertility(false, 20)
      expect(b.fertility).toEqual(20)
    })

    it('reduces 10% in times of want, sickness, or conflict', () => {
      const b = new Body()
      b.fertility = 100
      b.infertile = false
      b.adjustFertility(true, 20)
      expect(b.fertility).toEqual(90)
    })

    it('does nothing if you\'re infertile', () => {
      const b = new Body()
      b.makeInfertile()
      b.adjustFertility(false, 20)
      expect(b.fertility).toEqual(0)
    })
  })

  describe('isGone', () => {
    it('returns true if an eye is blind', () => {
      const b = new Body()
      b.eyes.right = 'Blind'
      expect(b.isGone('eyes', 'right'))
    })

    it('returns false if an eye is healthy', () => {
      const b = new Body()
      b.eyes.right = 'Healthy'
      expect(b.isGone('eyes', 'right')).not.toBe(true)
    })

    it('returns true if an ear is deaf', () => {
      const b = new Body()
      b.ears.right = 'Deaf'
      expect(b.isGone('ears', 'right'))
    })

    it('returns false if an ear is healthy', () => {
      const b = new Body()
      b.ears.right = 'Healthy'
      expect(b.isGone('ears', 'right')).not.toBe(true)
    })

    it('returns true if an arm is disabled', () => {
      const b = new Body()
      b.arms.right = 'Disabled'
      expect(b.isGone('arms', 'right'))
    })

    it('returns true if an arm is missing', () => {
      const b = new Body()
      b.arms.right = 'Missing'
      expect(b.isGone('arms', 'right'))
    })

    it('returns false if an arm is healthy', () => {
      const b = new Body()
      b.arms.right = 'Healthy'
      expect(b.isGone('arms', 'right')).not.toBe(true)
    })

    it('returns true if a leg is disabled', () => {
      const b = new Body()
      b.legs.right = 'Disabled'
      expect(b.isGone('legs', 'right'))
    })

    it('returns true if a leg is missing', () => {
      const b = new Body()
      b.legs.right = 'Missing'
      expect(b.isGone('legs', 'right'))
    })

    it('returns false if a leg is healthy', () => {
      const b = new Body()
      b.legs.right = 'Healthy'
      expect(b.isGone('legs', 'right')).not.toBe(true)
    })
  })

  describe('takeScar', () => {
    it('adds a scar', () => {
      const b = new Body()
      b.takeScar('face')
      expect(b.scars).toEqual([ 'face' ])
    })
  })

  describe('deafen', () => {
    it('will mark one ear as deaf', () => {
      const b = new Body()
      b.ears = { left: 'Healthy', right: 'Healthy' }
      const actual = b.deafen()
      expect(actual && (b.ears.left === 'Deaf' || b.ears.right === 'Deaf'))
    })

    it('will mark both ears as deaf if called twice', () => {
      const b = new Body()
      b.ears = { left: 'Healthy', right: 'Healthy' }
      const d1 = b.deafen()
      const d2 = b.deafen()
      expect(d1 && d2 && b.ears.left === 'Deaf' && b.ears.right === 'Deaf')
    })

    it('will return false if both ears are already deaf', () => {
      const b = new Body()
      b.ears = { left: 'Deaf', right: 'Deaf' }
      expect(b.deafen()).not.toBe(true)
    })
  })

  describe('blind', () => {
    it('will mark one eye as blind', () => {
      const b = new Body()
      b.eyes = { left: 'Healthy', right: 'Healthy' }
      const actual = b.blind()
      expect(actual && (b.eyes.left === 'Blind' || b.eyes.right === 'Blind'))
    })

    it('will mark both eyes as blind if called twice', () => {
      const b = new Body()
      b.eyes = { left: 'Healthy', right: 'Healthy' }
      const d1 = b.blind()
      const d2 = b.blind()
      expect(d1 && d2 && b.eyes.left === 'Blind' && b.eyes.right === 'Blind')
    })

    it('will return false if both eyes are already blind', () => {
      const b = new Body()
      b.eyes = { left: 'Blind', right: 'Blind' }
      expect(b.blind()).not.toBe(true)
    })
  })

  describe('getSick', () => {
    it('returns a prognosis', () => {
      const valid = [ 'death', 'deaf', 'blind', 'recovery' ]
      const b = new Body()
      const actual = b.getSick()
      expect(valid.includes(actual))
    })
  })

  describe('getHurt', () => {
    it('returns an outcome', () => {
      const b = new Body()
      const actual = b.getHurt()
      expect(typeof actual).toEqual('string')
    })
  })

  describe('checkForDyingOfOldAge', () => {
    it('will always return false before longevity', () => {
      const b = new Body()
      b.longevity = 90
      expect(b.checkForDyingOfOldAge(80)).not.toBe(true)
    })

    it('will always return true 10 years after longevity', () => {
      const b = new Body()
      b.longevity = 90
      expect(b.checkForDyingOfOldAge(100))
    })
  })
})
