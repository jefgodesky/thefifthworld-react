/* global describe, it, expect */

import skills from '../../data/skills'

import Community from './community'
import Person from './person'
import Skills from './skills'

import { allTrue } from '../../shared/utils'

describe('Skills', () => {
  describe('constructor', () => {
    it('adds an array of skills that you\'ve mastered', () => {
      const s = new Skills()
      expect(s.mastered).toEqual([])
    })
  })

  describe('getLearnableSkills', () => {
    it('returns an array of skill names', () => {
      const s = new Skills()
      const list = s.getLearnableSkills()
      expect(list.length).toEqual(skills.length - 1)
    })

    it('doesn\'t include any items that you\'ve already mastered', () => {
      const s = new Skills()
      s.mastered = [ 'Acting' ]
      const list = s.getLearnableSkills()
      expect(list.length).toEqual(skills.length - 2)
    })

    it('includes subskills of skills you\'ve mastered', () => {
      const s = new Skills()
      const skill = 'Medicine'
      s.mastered = [ skill ]
      const skillObj = skills.filter(s => s.name === skill).pop()
      const subskills = skillObj.specializations
      const list = s.getLearnableSkills()
      expect(list.length).toEqual(skills.length - 2 + subskills.length)
    })

    it('adds opportunities to learn from others in the community', () => {
      const c = new Community()
      const p1 = new Person()
      p1.skills.mastered = [ 'Acting' ]
      c.add(p1)
      const p2 = new Person()
      c.add(p2)
      const list = p2.skills.getLearnableSkills(c)
      const actual = list.filter(s => s === 'Acting').length
      expect(actual).toEqual(2)
    })

    it('doesn\'t include specializations of skills you don\'t know that someone has mastered', () => {
      const c = new Community()
      const p1 = new Person()
      p1.skills.mastered = [ 'Science', 'Ecology' ]
      c.add(p1)
      const p2 = new Person()
      c.add(p2)
      const list = p2.skills.getLearnableSkills(c)
      const tests = [
        list.includes('Science'),
        !list.includes('Ecology')
      ]
      expect(allTrue(tests)).toEqual(true)
    })
  })

  describe('getMagicalCalling', () => {
    it('returns a number', () => {
      const c = new Community()
      const p = new Person()
      c.add(p)
      expect(Skills.getMagicalCalling(p, c)).not.toBeNaN()
    })

    it('returns a number greater than zero', () => {
      const c = new Community()
      const p = new Person()
      c.add(p)
      expect(Skills.getMagicalCalling(p, c)).toBeGreaterThan(0)
    })

    it('returns a number less than 100', () => {
      const c = new Community()
      const p = new Person()
      c.add(p)
      expect(Skills.getMagicalCalling(p, c)).toBeLessThan(100)
    })
  })
})
