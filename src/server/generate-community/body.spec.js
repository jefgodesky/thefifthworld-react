/* global describe, it, expect */

import Body from './body'

import { allTrue, anyTrue } from '../../shared/utils'

describe('Body', () => {
  describe('constructor', () => {
    it('assigns a longevity', () => {
      const b = new Body()
      expect(!isNaN(b.longevity)).toEqual(true)
    })

    it('assigns an attractiveness', () => {
      const b = new Body()
      expect(!isNaN(b.attractiveness)).toEqual(true)
    })

    it('assigns a body type', () => {
      const b = new Body()
      expect(!isNaN(b.type)).toEqual(true)
    })

    it('creates eyes', () => {
      const b = new Body()
      const valid = [ 'blind', 'healthy' ]
      const tests = [
        valid.includes(b.eyes.left),
        valid.includes(b.eyes.right)
      ]
      expect(allTrue(tests)).toEqual(true)
    })

    it('creates ears', () => {
      const b = new Body()
      const valid = [ 'deaf', 'healthy' ]
      const tests = [
        valid.includes(b.ears.left),
        valid.includes(b.ears.right)
      ]
      expect(allTrue(tests)).toEqual(true)
    })

    it('creates arms', () => {
      const b = new Body()
      const valid = [ 'disabled', 'healthy' ]
      const tests = [
        valid.includes(b.arms.left),
        valid.includes(b.arms.right)
      ]
      expect(allTrue(tests)).toEqual(true)
    })

    it('creates legs', () => {
      const b = new Body()
      const valid = [ 'disabled', 'healthy' ]
      const tests = [
        valid.includes(b.legs.left),
        valid.includes(b.legs.right)
      ]
      expect(allTrue(tests)).toEqual(true)
    })

    it('determines achondroplasia', () => {
      const b = new Body()
      expect(typeof b.achondroplasia).toEqual('boolean')
    })

    it('sets fertility', () => {
      const b = new Body()
      expect(b.fertility).toEqual(0)
    })

    it('starts a list of scars', () => {
      const b = new Body()
      expect(b.scars).toEqual([])
    })

    it('sets male reproductive capability', () => {
      const b = new Body()
      expect(typeof b.male).toEqual('boolean')
    })

    it('sets female reproductive capability', () => {
      const b = new Body()
      expect(typeof b.female).toEqual('boolean')
    })

    it('makes about 1 in 10 bodies infertile', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const b = new Body()
        if (b.infertile) count++
      }
      const notTooFew = count > 0
      const notTooMany = count < 25
      expect(notTooFew && notTooMany).toEqual(true)
    })
  })

  describe('makeInfertile', () => {
    it('adds an infertile flag', () => {
      const b = new Body()
      b.makeInfertile()
      expect(b.infertile).toEqual(true)
    })

    it('reduces fertility to zero', () => {
      const b = new Body()
      b.makeInfertile()
      expect(b.fertility).toEqual(0)
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
      b.female = true
      b.male = false
      b.fertility = 100
      b.infertile = false
      b.adjustFertility(false, 45)
      expect(b.fertility).toBeLessThan(50)
    })

    it('drops below 50% for a male at age 56', () => {
      const b = new Body()
      b.female = false
      b.male = true
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

    it('reduces 5% in times of want, sickness, or conflict', () => {
      const b = new Body()
      b.fertility = 100
      b.infertile = false
      b.adjustFertility(true, 20)
      expect(b.fertility).toEqual(95)
    })

    it('does nothing if you\'re infertile', () => {
      const b = new Body()
      b.makeInfertile()
      b.adjustFertility(false, 20)
      expect(b.fertility).toEqual(0)
    })
  })

  describe('isGone', () => {
    it('reports if an eye is blind', () => {
      const b = new Body()
      b.eyes.left = 'blind'
      expect(b.isGone('left eye')).toEqual(true)
    })

    it('reports if an ear is deaf', () => {
      const b = new Body()
      b.ears.right = 'deaf'
      expect(b.isGone('right ear')).toEqual(true)
    })

    it('reports if an arm is missing', () => {
      const b = new Body()
      b.arms.left = 'missing'
      expect(b.isGone('left arm')).toEqual(true)
    })

    it('reports if a leg is disabled', () => {
      const b = new Body()
      b.legs.right = 'disabled'
      expect(b.isGone('right leg')).toEqual(true)
    })

    it('reports if the body part is just fine', () => {
      const b = new Body()
      b.legs.right = 'healthy'
      expect(b.isGone('right leg')).toEqual(false)
    })
  })

  describe('takeScar', () => {
    it('adds  scar to the list', () => {
      const b = new Body()
      b.takeScar('torso')
      expect(b.scars).toEqual([ 'torso' ])
    })
  })

  describe('reportScars', () => {
    it('returns an empty object for an unscarred body', () => {
      const b = new Body()
      expect(b.reportScars()).toEqual({})
    })

    it('returns an object with a property for each scar location', () => {
      const b = new Body()
      b.takeScar('torso')
      b.takeScar('left leg')
      expect(b.reportScars()).toEqual({ 'torso': 1, 'left leg': 1 })
    })

    it('reports multiple scars to a single location', () => {
      const b = new Body()
      b.takeScar('torso')
      b.takeScar('torso')
      b.takeScar('left leg')
      expect(b.reportScars()).toEqual({ 'torso': 2, 'left leg': 1 })
    })
  })

  describe('deafen', () => {
    it('will mark one ear as deaf', () => {
      const b = new Body()
      b.ears = { left: 'healthy', right: 'healthy' }
      const actual = b.deafen()
      const tests = [
        b.ears.left === 'deaf',
        b.ears.right === 'deaf'
      ]
      expect(actual && anyTrue(tests)).toEqual(true)
    })

    it('will mark both ears as deaf if called twice', () => {
      const b = new Body()
      b.ears = { left: 'healthy', right: 'healthy' }
      const d1 = b.deafen()
      const d2 = b.deafen()
      const tests = [
        d1,
        d2,
        b.ears.left === 'deaf',
        b.ears.right === 'deaf'
      ]
      expect(allTrue(tests)).toEqual(true)
    })

    it('will return false if both ears are already deaf', () => {
      const b = new Body()
      b.ears = { left: 'deaf', right: 'deaf' }
      expect(b.deafen()).toEqual(false)
    })
  })

  describe('blind', () => {
    it('will mark one eye as blind', () => {
      const b = new Body()
      b.eyes = { left: 'healthy', right: 'healthy' }
      const actual = b.blind()
      const tests = [
        b.eyes.left === 'blind',
        b.eyes.right === 'blind'
      ]
      expect(actual && anyTrue(tests)).toEqual(true)
    })

    it('will mark both eyes as blind if called twice', () => {
      const b = new Body()
      b.eyes = { left: 'healthy', right: 'healthy' }
      const d1 = b.blind()
      const d2 = b.blind()
      const tests = [
        d1,
        d2,
        b.eyes.left === 'blind',
        b.eyes.right === 'blind'
      ]
      expect(allTrue(tests)).toEqual(true)
    })

    it('will return false if both eyes are already blind', () => {
      const b = new Body()
      b.eyes = { left: 'blind', right: 'blind' }
      expect(b.blind()).toEqual(false)
    })
  })
})
