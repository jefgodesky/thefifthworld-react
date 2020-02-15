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
  })
})
