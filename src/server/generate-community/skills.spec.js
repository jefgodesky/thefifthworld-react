/* global describe, it, expect */

import Skills from './skills'

describe('Skills', () => {
  describe('constructor', () => {
    it('adds an array of skills that you\'ve mastered', () => {
      const s = new Skills()
      expect(s.mastered).toEqual([])
    })
  })
})
