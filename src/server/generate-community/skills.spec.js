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
      const p1 = new Person(c)
      p1.skills.mastered = [ 'Acting' ]
      const p2 = new Person(c)
      const list = p2.skills.getLearnableSkills(c)
      const actual = list.filter(s => s === 'Acting').length
      expect(actual).toEqual(2)
    })

    it('doesn\'t include specializations of skills you don\'t know that someone has mastered', () => {
      const c = new Community()
      const p1 = new Person(c)
      p1.skills.mastered = [ 'Science', 'Ecology' ]
      const p2 = new Person(c)
      const list = p2.skills.getLearnableSkills(c)
      const tests = [
        list.includes('Science'),
        !list.includes('Ecology')
      ]
      expect(allTrue(tests)).toEqual(true)
    })
  })

  describe('startLearning', () => {
    it('defines the skill you\'re learning', () => {
      const s = new Skills()
      s.startLearning('Unit testing')
      expect(s.learning.skill).toEqual('Unit testing')
    })

    it('defines how long it will take to learn the skill', () => {
      const s = new Skills()
      s.startLearning('Unit testing')
      expect(s.learning.required).toEqual(7)
    })

    it('starts progress at zero', () => {
      const s = new Skills()
      s.startLearning('Unit testing')
      expect(s.learning.progress).toEqual(0)
    })

    it('takes less time if you\'re smarter', () => {
      const s = new Skills()
      s.startLearning('Unit testing', 1)
      expect(s.learning.required).toEqual(6)
    })
  })

  describe('progress', () => {
    it('increments progress', () => {
      const s = new Skills()
      s.startLearning('Unit testing')
      s.progress()
      expect(s.learning.progress).toEqual(1)
    })

    it('adds the skill to those you\'ve mastered when you reach required progress', () => {
      const s = new Skills()
      s.startLearning('Unit testing')
      s.learning.progress = 6
      s.progress()
      expect(s.mastered).toContain('Unit testing')
    })

    it('deletes the entire learning object when you reach required progress', () => {
      const s = new Skills()
      s.startLearning('Unit testing')
      s.learning.progress = 6
      s.progress()
      expect(s.learning).toEqual(undefined)
    })
  })

  describe('getMagicalCalling', () => {
    it('returns a number', () => {
      const c = new Community()
      const p = new Person(c)
      expect(Skills.getMagicalCalling(p, c)).not.toBeNaN()
    })

    it('returns a number greater than zero', () => {
      const c = new Community()
      const p = new Person(c)
      expect(Skills.getMagicalCalling(p, c)).toBeGreaterThan(0)
    })

    it('returns a number less than 100', () => {
      const c = new Community()
      const p = new Person(c)
      expect(Skills.getMagicalCalling(p, c)).toBeLessThan(100)
    })
  })

  describe('considerMagic', () => {
    it('returns a boolean', () => {
      const c = new Community()
      const p = new Person(c)
      expect(typeof Skills.considerMagic(p, c)).toEqual('boolean')
    })

    it('starts the person learning magic if it returns true', () => {
      const c = new Community()
      const p = new Person(c)
      const res = Skills.considerMagic(p, c)
      expect(!res || (res && p.skills.learning.skill === 'Magic')).toEqual(true)
    })
  })

  describe('considerFavoredSkill', () => {
    it('returns a boolean', () => {
      const c = new Community()
      const p = new Person(c)
      expect(typeof Skills.considerFavoredSkill(p, c)).toEqual('boolean')
    })

    it('returns false if the community doesn\'t have a favored skill', () => {
      const c = new Community()
      const p = new Person(c)
      expect(Skills.considerFavoredSkill(p, c)).toEqual(false)
    })

    it('starts the person learning the favored skill if it returns true', () => {
      const c = new Community({ traditions: { skill: 'Unit testing' } })
      const p = new Person(c)
      const res = Skills.considerFavoredSkill(p, c)
      expect(!res || (res && p.skills.learning.skill === 'Unit testing')).toEqual(true)
    })

    it('returns true more often if someone is agreeable', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const c = new Community({ traditions: { skill: 'Unit testing' } })
        const p = new Person(c)
        p.personality.agreeableness = 1
        if (Skills.considerFavoredSkill(p, c)) count++
      }
      expect(count).toBeGreaterThan(50)
    })
  })

  describe('considerHealing', () => {
    it('returns a boolean', () => {
      const p = new Person()
      expect(typeof Skills.considerHealing(p)).toEqual('boolean')
    })

    it('returns false if the person already knows medicine', () => {
      const p = new Person()
      p.skills.mastered.push('Medicine')
      expect(Skills.considerHealing(p)).toEqual(false)
    })

    it('starts the person learning medicine if it returns true', () => {
      const p = new Person()
      const res = Skills.considerHealing(p)
      expect(!res || (res && p.skills.learning.skill === 'Medicine')).toEqual(true)
    })

    it('returns true more often if someone is agreeable', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const p = new Person()
        p.personality.agreeableness = 1
        if (Skills.considerHealing(p)) count++
      }
      expect(count).toBeGreaterThan(0)
    })

    it('returns true more often if the community has faced a lot of sickness recently', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const p = new Person()
        if (Skills.considerHealing(p, 10)) count++
      }
      expect(count).toBeGreaterThan(25)
    })
  })

  describe('considerDeescalation', () => {
    it('returns a boolean', () => {
      const p = new Person()
      expect(typeof Skills.considerDeescalation(p)).toEqual('boolean')
    })

    it('returns false if the person already knows deescalation', () => {
      const p = new Person()
      p.skills.mastered.push('Deescalation')
      expect(Skills.considerDeescalation(p)).toEqual(false)
    })

    it('starts the person learning deescalation if it returns true', () => {
      const p = new Person()
      const res = Skills.considerDeescalation(p)
      expect(!res || (res && p.skills.learning.skill === 'Deescalation')).toEqual(true)
    })

    it('returns true more often if someone is agreeable', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const p = new Person()
        p.personality.agreeableness = 1
        if (Skills.considerDeescalation(p)) count++
      }
      expect(count).toBeGreaterThan(0)
    })

    it('returns true more often if the community has faced a lot of conflict recently', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const p = new Person()
        if (Skills.considerDeescalation(p, 10)) count++
      }
      expect(count).toBeGreaterThan(25)
    })
  })
})
