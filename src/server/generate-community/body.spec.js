/* global describe, it, expect */

import Body from './body'

import { allTrue, anyTrue, isPopulatedArray } from '../../shared/utils'

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
      const sides = [ 'left', 'right' ]
      expect(sides.includes(actual) && b.ears[actual] === 'deaf').toEqual(true)
    })

    it('will mark one ear as missing if it\'s an injury', () => {
      const b = new Body()
      b.ears = { left: 'healthy', right: 'healthy' }
      const actual = b.deafen(true)
      const sides = [ 'left', 'right' ]
      expect(sides.includes(actual) && b.ears[actual] === 'missing').toEqual(true)
    })

    it('will mark both ears as blind if called twice', () => {
      const b = new Body()
      b.ears = { left: 'healthy', right: 'healthy' }
      b.deafen(); b.deafen()
      const tests = [
        b.ears.left === 'deaf',
        b.ears.right === 'deaf'
      ]
      expect(allTrue(tests)).toEqual(true)
    })

    it('will return \'none\' if both ears are already deaf', () => {
      const b = new Body()
      b.ears = { left: 'deaf', right: 'deaf' }
      expect(b.deafen()).toEqual('none')
    })
  })

  describe('blind', () => {
    it('will mark one eye as blind', () => {
      const b = new Body()
      b.eyes = { left: 'healthy', right: 'healthy' }
      const actual = b.blind()
      const sides = [ 'left', 'right' ]
      expect(sides.includes(actual) && b.eyes[actual] === 'blind').toEqual(true)
    })

    it('will mark one eye as missing if it\'s an injury', () => {
      const b = new Body()
      b.eyes = { left: 'healthy', right: 'healthy' }
      const actual = b.blind(true)
      const sides = [ 'left', 'right' ]
      expect(sides.includes(actual) && b.eyes[actual] === 'missing').toEqual(true)
    })

    it('will mark both eyes as blind if called twice', () => {
      const b = new Body()
      b.eyes = { left: 'healthy', right: 'healthy' }
      b.blind(); b.blind()
      const tests = [
        b.eyes.left === 'blind',
        b.eyes.right === 'blind'
      ]
      expect(allTrue(tests)).toEqual(true)
    })

    it('will return \'none\' if both eyes are already blind', () => {
      const b = new Body()
      b.eyes = { left: 'blind', right: 'blind' }
      expect(b.blind()).toEqual('none')
    })
  })

  describe('getSick', () => {
    it('returns an event tagged as a sickness', () => {
      const b = new Body()
      const actual = b.getSick()
      expect(actual.tags.includes('sickness')).toEqual(true)
    })

    it('returns a prognosis', () => {
      const b = new Body()
      const possibilities = [ 'death', 'deaf', 'blind', 'recovery' ]
      const actual = b.getSick()
      expect(possibilities.includes(actual.prognosis)).toEqual(true)
    })

    it('usually returns a recovery', () => {
      const b = new Body()
      let recoveries = 0
      for (let i = 0; i < 100; i++) {
        const e = b.getSick()
        if (e.prognosis === 'recovery') recoveries++
      }
      expect(recoveries).toBeGreaterThan(85)
    })

    it('sometimes returns a death', () => {
      const b = new Body()
      let deaths = 0
      for (let i = 0; i < 100; i++) {
        const e = b.getSick()
        if (e.prognosis === 'death') deaths++
      }
      expect(deaths).toBeLessThan(10)
    })

    it('sometimes results in someone losing hearing in one ear', () => {
      const b = new Body()
      let deaf = 0
      for (let i = 0; i < 100; i++) {
        const e = b.getSick()
        if (e.prognosis === 'deaf') deaf++
      }
      expect(deaf).toBeLessThan(10)
    })

    it('sometimes results in someone losing sight in one eye', () => {
      const b = new Body()
      let blind = 0
      for (let i = 0; i < 100; i++) {
        const e = b.getSick()
        if (e.prognosis === 'blind') blind++
      }
      expect(blind).toBeLessThan(10)
    })
  })

  describe('hurtFace', () => {
    it('returns a report', () => {
      const b = new Body()
      const report = b.hurtFace()
      const locations = [ 'face', 'left eye', 'right eye', 'left ear', 'right ear' ]
      expect(isPopulatedArray(report.tags) && locations.includes(report.location)).toEqual(true)
    })

    it('leaves a scar', () => {
      const b = new Body()
      b.hurtFace()
      expect(b.scars.length).toEqual(1)
    })

    it('sometimes loses an eye', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const b = new Body()
        b.hurtFace()
        if (b.eyes.left === 'missing' || b.eyes.right === 'missing') count++
      }
      expect(count).toBeGreaterThan(0)
    })

    it('sometimes loses an ear', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const b = new Body()
        b.hurtFace()
        if (b.ears.left === 'missing' || b.ears.right === 'missing') count++
      }
      expect(count).toBeGreaterThan(0)
    })
  })

  describe('hurtLimb', () => {
    it('returns a report', () => {
      const b = new Body()
      const report = b.hurtLimb()
      const locations = [ 'torso', 'left arm', 'right arm', 'left leg', 'right leg' ]
      expect(isPopulatedArray(report.tags) && locations.includes(report.location)).toEqual(true)
    })

    it('leaves a scar', () => {
      const b = new Body()
      b.hurtLimb()
      expect(b.scars.length).toEqual(1)
    })

    it('hurts the torso if the limb is missing', () => {
      const b = new Body()
      b.arms = { left: 'missing', right: 'missing' }
      b.legs = { left: 'missing', right: 'missing' }
      b.hurtLimb()
      expect(b.scars).toEqual([ 'torso' ])
    })

    it('can mean losing the limb', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const b = new Body()
        const report = b.hurtLimb()
        if (report.tags.includes('lost limb')) count++
      }
      expect(count).toBeGreaterThan(0)
    })
  })

  describe('hurtTorso', () => {
    it('returns a report', () => {
      const b = new Body()
      const report = b.hurtTorso()
      const locations = [ 'groin', 'chest', 'belly', 'back', 'left side', 'right side'  ]
      expect(isPopulatedArray(report.tags) && locations.includes(report.location)).toEqual(true)
    })

    it('leaves a scar', () => {
      const b = new Body()
      b.hurtTorso()
      expect(b.scars.length).toEqual(1)
    })

    it('can castrate a male', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const b = new Body()
        b.male = true
        const report = b.hurtTorso()
        if (report.tags.includes('castration') && b.infertile === true) count++
      }
      expect(count).toBeGreaterThan(0)
    })

    it('can make a female infertile', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const b = new Body()
        b.infertile = false
        b.female = true
        const report = b.hurtTorso()
        if (report.location === 'belly' && b.infertile === true) count++
      }
      expect(count).toBeGreaterThan(0)
    })

    it('can result in paralysis', () => {
      let count = 0
      for (let i = 0; i < 500; i++) {
        const b = new Body()
        const report = b.hurtTorso()
        const isParalyzed = b.legs.left === 'paralyzed' && b.legs.right === 'paralyzed'
        if (report.tags.includes('paralysis') && isParalyzed) count++
      }
      expect(count).toBeGreaterThan(0)
    })
  })

  describe('getHurt', () => {
    it('returns a report', () => {
      const b = new Body()
      const report = b.getHurt()
      expect(isPopulatedArray(report.tags)).toEqual(true)
    })

    it('can get infected', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const b = new Body()
        const report = b.getHurt()
        if (report.infection) count++
      }
      expect(count).toBeGreaterThan(0)
    })

    it('can be lethal', () => {
      let count = 0
      for (let i = 0; i < 1000; i++) {
        const b = new Body()
        const report = b.getHurt()
        if (report.lethal) count++
      }
      expect(count).toBeGreaterThan(0)
    })

    it('leaves a scar', () => {
      const b = new Body()
      const report = b.getHurt()
      const lethal = Boolean(report.lethal)
      const scar = b.scars.length > 0
      expect(lethal || scar).toEqual(true)
    })
  })

  describe('checkForDyingOfOldAge', () => {
    it('will always return false before longevity', () => {
      const b = new Body()
      b.longevity = 90
      expect(b.checkForDyingOfOldAge(80)).toEqual(false)
    })

    it('will always return true 10 years after longevity', () => {
      const b = new Body()
      b.longevity = 90
      expect(b.checkForDyingOfOldAge(100)).toEqual(true)
    })
  })

  describe('copy', () => {
    it('copies longevity', () => {
      const b = new Body()
      const c = Body.copy(b)
      expect(b.longevity).toEqual(c.longevity)
    })

    it('copies attractiveness', () => {
      const b = new Body()
      const c = Body.copy(b)
      expect(b.attractiveness).toEqual(c.attractiveness)
    })

    it('copies body type', () => {
      const b = new Body()
      const c = Body.copy(b)
      expect(b.type).toEqual(c.type)
    })

    it('copies eyes', () => {
      const b = new Body()
      const c = Body.copy(b)
      expect(`${b.eyes.left} ${b.eyes.right}`).toEqual(`${c.eyes.left} ${c.eyes.right}`)
    })

    it('copies ears', () => {
      const b = new Body()
      const c = Body.copy(b)
      expect(`${b.ears.left} ${b.ears.right}`).toEqual(`${c.ears.left} ${c.ears.right}`)
    })

    it('copies limbs', () => {
      const b = new Body()
      const c = Body.copy(b)
      const blimbs = `${b.arms.left} ${b.arms.right} ${b.legs.left} ${b.legs.right}`
      const climbs = `${c.arms.left} ${c.arms.right} ${c.legs.left} ${c.legs.right}`
      expect(blimbs).toEqual(climbs)
    })

    it('copies achondroplasia', () => {
      const b = new Body()
      const c = Body.copy(b)
      expect(b.achondroplasia).toEqual(c.achondroplasia)
    })

    it('copies sex', () => {
      const b = new Body()
      const c = Body.copy(b)
      expect(`${b.male} ${b.female}`).toEqual(`${c.male} ${c.female}`)
    })

    it('copies fertility', () => {
      const b = new Body()
      const c = Body.copy(b)
      expect(`${b.infertile} ${b.fertility}`).toEqual(`${c.infertile} ${c.fertility}`)
    })

    it('copies scars', () => {
      const b = new Body()
      const c = Body.copy(b)
      expect(b.scars).toEqual(c.scars)
    })

    it('creates a deep copy', () => {
      const b = new Body()
      const c = Body.copy(b)
      b.takeScar('concept of self')
      expect(b.scars).not.toEqual(c.scars)
    })
  })
})
