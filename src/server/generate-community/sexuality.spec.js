/* global describe, it, expect */

import Body from './body'
import Sexuality from './sexuality'

describe('Sexuality', () => {
  describe('constructor', () => {
    it('assigns an androphilia score', () => {
      const b = new Body()
      const s = new Sexuality(b)
      expect(s.androphilia).toBeGreaterThanOrEqual(0)
    })

    it('assigns a gynephilia score', () => {
      const b = new Body()
      const s = new Sexuality(b)
      expect(s.gynephilia).toBeGreaterThanOrEqual(0)
    })

    it('assigns a skoliophilia score', () => {
      const b = new Body()
      const s = new Sexuality(b)
      expect(s.skoliophilia).toBeGreaterThanOrEqual(0)
    })
  })
})
