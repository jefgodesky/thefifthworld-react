/* global describe, it, expect */

import Body from './body'

describe('Body', () => {
  describe('constructor', () => {
    it('assigns a body type', () => {
      const b = new Body()
      expect(typeof b.type).toEqual('number')
    })

    it('determines if both eyes can see', () => {
      const b = new Body()
      const actual = [
        b.eyes.left === 'Blind' || b.eyes.left === 'Healthy',
        b.eyes.right === 'Blind' || b.eyes.right === 'Healthy'
      ].reduce((acc, curr) => acc && curr, true)
      expect(actual).toEqual(true)
    })

    it('determines if both ears can hear', () => {
      const b = new Body()
      const actual = [
        b.ears.left === 'Deaf' || b.ears.left === 'Healthy',
        b.ears.right === 'Deaf' || b.ears.right === 'Healthy'
      ].reduce((acc, curr) => acc && curr, true)
      expect(actual).toEqual(true)
    })

    it('determines if both arms are healthy', () => {
      const b = new Body()
      const actual = [
        b.arms.left === 'Disabled' || b.arms.left === 'Healthy',
        b.arms.right === 'Disabled' || b.arms.right === 'Healthy'
      ].reduce((acc, curr) => acc && curr, true)
      expect(actual).toEqual(true)
    })

    it('determines if both legs are healthy', () => {
      const b = new Body()
      const actual = [
        b.legs.left === 'Disabled' || b.legs.left === 'Healthy',
        b.legs.right === 'Disabled' || b.legs.right === 'Healthy'
      ].reduce((acc, curr) => acc && curr, true)
      expect(actual).toEqual(true)
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

    it('can record scars', () => {
      const b = new Body()
      const { scars } = b
      expect(scars && Array.isArray(scars) && scars.length === 0).toEqual(true)
    })

    it('can have a specified gender', () => {
      const b = new Body('Man')
      const actual = [
        typeof b.hasPenis === 'boolean',
        typeof b.hasWomb === 'boolean'
      ].reduce((acc, curr) => acc && curr, true)
      expect(actual).toEqual(true)
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
      expect(actual).toEqual(true)
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
  })
})
