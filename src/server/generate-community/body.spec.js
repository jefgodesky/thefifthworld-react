/* global describe, it, expect */

import Body from './body'

import { allTrue } from '../../shared/utils'

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
})
