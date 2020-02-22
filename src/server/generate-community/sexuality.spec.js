/* global describe, it, expect */

import Body from './body'
import Person from './person'
import Personality from './personality'
import Sexuality from './sexuality'

import { between } from '../../shared/utils'

describe('Sexuality', () => {
  describe('constructor', () => {
    it('assigns androphilia between 0 and 100', () => {
      const s = new Sexuality()
      expect(between(s.androphilia, 0, 100)).toEqual(s.androphilia)
    })

    it('assigns gynephilia between 0 and 100', () => {
      const s = new Sexuality()
      expect(between(s.gynephilia, 0, 100)).toEqual(s.gynephilia)
    })

    it('assigns skoliophilia between 0 and 100', () => {
      const s = new Sexuality()
      expect(between(s.skoliophilia, 0, 100)).toEqual(s.skoliophilia)
    })

    it('assigns males higher gynephilia than androphilia about 85% of the time', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const b = new Body()
        b.male = true; b.female = false
        const s = new Sexuality(b)
        if (s.gynephilia > s.androphilia) count++
      }
      expect(count).toBeGreaterThan(70)
    })

    it('assigns females higher androphilia than gynephilia about 85% of the time', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const b = new Body()
        b.male = false; b.female = true
        const s = new Sexuality(b)
        if (s.androphilia > s.gynephilia) count++
      }
      expect(count).toBeGreaterThan(70)
    })

    it('increases skoliophilia for people who are more open to new experiences', () => {
      const control = []
      for (let i = 0; i < 25; i++) {
        const p = new Personality({ openness: 0 })
        const s = new Sexuality(undefined, p)
        control.push(s.skoliophilia)
      }
      const cavg = control.reduce((acc, curr) => acc + curr) / 10

      const test = []
      for (let i = 0; i < 25; i++) {
        const p = new Personality({ openness: 3 })
        const s = new Sexuality(undefined, p)
        test.push(s.skoliophilia)
      }
      const tavg = test.reduce((acc, curr) => acc + curr) / 10

      expect(tavg).toBeGreaterThan(cavg)
    })
  })

  describe('isAttractedTo', () => {
    it('returns a boolean', () => {
      const s = new Sexuality()
      const object = new Person()
      expect(typeof s.isAttractedTo(object)).toEqual('boolean')
    })

    it('returns false if you have no attraction matrix', () => {
      const s = new Sexuality()
      const object = new Person()
      expect(s.isAttractedTo(object)).toEqual(false)
    })

    it('sometimes returns true', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const subject = new Person()
        const object = new Person()
        if (subject.sexuality.isAttractedTo(object)) count++
      }
      expect(count).toBeGreaterThan(0)
    })
  })
})
