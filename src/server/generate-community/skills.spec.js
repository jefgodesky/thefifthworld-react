/* global describe, it, expect */

import Community from './community'
import Person from './person'
import Skills from './skills'
import skills from '../../data/skills'

describe('Skills', () => {
  describe('constructor', () => {
    it('adds an array of skills that you\'ve mastered', () => {
      const s = new Skills()
      expect(Array.isArray(s.mastered))
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
      const expected = list.filter(s => s === 'Acting')
      expect(expected.length).toEqual(2)
    })
  })

  describe('getMagicalCalling', () => {
    it('returns 1 for a person in a community that considers magic a secret who has no qualifications', () => {
      const mother = new Person()
      const father = new Person()
      const p = new Person()
      p.body.mother = mother
      p.body.father = father
      p.body.hasPenis = false
      p.body.hasWomb = true
      p.gender = 'Woman'
      p.body.achondroplasia = false
      p.neurodivergent = false
      expect(Skills.getMagicalCalling(p, true)).toEqual(1)
    })

    it('returns 75 for the daughter of a wizard mother in a community that considers magic a secret', () => {
      const mother = new Person()
      mother.skills.mastered = [ 'Magic' ]
      const father = new Person()
      const p = new Person()
      p.body.mother = mother
      p.body.father = father
      p.body.hasPenis = false
      p.body.hasWomb = true
      p.gender = 'Woman'
      p.body.achondroplasia = false
      p.neurodivergent = false
      expect(Skills.getMagicalCalling(p, true)).toEqual(75)
    })

    it('returns 75 for the daughter of a wizard father in a community that considers magic a secret', () => {
      const mother = new Person()
      const father = new Person()
      father.skills.mastered = [ 'Magic' ]
      const p = new Person()
      p.body.mother = mother
      p.body.father = father
      p.body.hasPenis = false
      p.body.hasWomb = true
      p.gender = 'Woman'
      p.body.achondroplasia = false
      p.neurodivergent = false
      expect(Skills.getMagicalCalling(p, true)).toEqual(75)
    })

    it('returns 95 for the daughter of two wizard parents in a community that considers magic a secret', () => {
      const mother = new Person()
      mother.skills.mastered = [ 'Magic' ]
      const father = new Person()
      father.skills.mastered = [ 'Magic' ]
      const p = new Person()
      p.body.mother = mother
      p.body.father = father
      p.body.hasPenis = false
      p.body.hasWomb = true
      p.gender = 'Woman'
      p.body.achondroplasia = false
      p.neurodivergent = false
      expect(Skills.getMagicalCalling(p, true)).toEqual(95)
    })

    it('returns 5 for an intersex person in a community that considers magic a secret', () => {
      const mother = new Person()
      const father = new Person()
      const p = new Person()
      p.body.mother = mother
      p.body.father = father
      p.body.hasPenis = false
      p.body.hasWomb = false
      p.gender = 'Woman'
      p.body.achondroplasia = false
      p.neurodivergent = false
      expect(Skills.getMagicalCalling(p, true)).toEqual(5)
    })

    it('returns 5 for a person of a special gender in a community that considers magic a secret', () => {
      const mother = new Person()
      const father = new Person()
      const p = new Person()
      p.body.mother = mother
      p.body.father = father
      p.body.hasPenis = false
      p.body.hasWomb = true
      p.gender = 'Third gender'
      p.body.achondroplasia = false
      p.neurodivergent = false
      expect(Skills.getMagicalCalling(p, true)).toEqual(5)
    })

    it('returns 5 for a dwarf in a community that considers magic a secret', () => {
      const mother = new Person()
      const father = new Person()
      const p = new Person()
      p.body.mother = mother
      p.body.father = father
      p.body.hasPenis = false
      p.body.hasWomb = true
      p.gender = 'Woman'
      p.body.achondroplasia = true
      p.neurodivergent = false
      expect(Skills.getMagicalCalling(p, true)).toEqual(5)
    })

    it('returns 5 for a neurodivergent person in a community that considers magic a secret', () => {
      const mother = new Person()
      const father = new Person()
      const p = new Person()
      p.body.mother = mother
      p.body.father = father
      p.body.hasPenis = false
      p.body.hasWomb = true
      p.gender = 'Woman'
      p.body.achondroplasia = false
      p.neurodivergent = true
      expect(Skills.getMagicalCalling(p, true)).toEqual(5)
    })

    it('returns 15 for a neurodivergent dwarf of a special gender in a community that considers magic a secret', () => {
      const mother = new Person()
      const father = new Person()
      const p = new Person()
      p.body.mother = mother
      p.body.father = father
      p.body.hasPenis = false
      p.body.hasWomb = true
      p.gender = 'Third gender'
      p.body.achondroplasia = true
      p.neurodivergent = true
      expect(Skills.getMagicalCalling(p, true)).toEqual(15)
    })

    it('returns 10 for a person in a community that considers magic open who has no qualifications', () => {
      const mother = new Person()
      const father = new Person()
      const p = new Person()
      p.body.mother = mother
      p.body.father = father
      p.body.hasPenis = false
      p.body.hasWomb = true
      p.gender = 'Woman'
      p.body.achondroplasia = false
      p.neurodivergent = false
      expect(Skills.getMagicalCalling(p, false)).toEqual(10)
    })

    it('returns 25 for a the daughter of a wizard mother in a community that considers magic open', () => {
      const mother = new Person()
      mother.skills.mastered = [ 'Magic' ]
      const father = new Person()
      const p = new Person()
      p.body.mother = mother
      p.body.father = father
      p.body.hasPenis = false
      p.body.hasWomb = true
      p.gender = 'Woman'
      p.body.achondroplasia = false
      p.neurodivergent = false
      expect(Skills.getMagicalCalling(p, false)).toEqual(25)
    })

    it('returns 25 for a the daughter of a wizard father in a community that considers magic open', () => {
      const mother = new Person()
      const father = new Person()
      father.skills.mastered = [ 'Magic' ]
      const p = new Person()
      p.body.mother = mother
      p.body.father = father
      p.body.hasPenis = false
      p.body.hasWomb = true
      p.gender = 'Woman'
      p.body.achondroplasia = false
      p.neurodivergent = false
      expect(Skills.getMagicalCalling(p, false)).toEqual(25)
    })

    it('returns 50 for a the daughter of two wizard parents in a community that considers magic open', () => {
      const mother = new Person()
      mother.skills.mastered = [ 'Magic' ]
      const father = new Person()
      father.skills.mastered = [ 'Magic' ]
      const p = new Person()
      p.body.mother = mother
      p.body.father = father
      p.body.hasPenis = false
      p.body.hasWomb = true
      p.gender = 'Woman'
      p.body.achondroplasia = false
      p.neurodivergent = false
      expect(Skills.getMagicalCalling(p, false)).toEqual(50)
    })

    it('returns 35 for an intersex person in a community that considers magic open', () => {
      const mother = new Person()
      const father = new Person()
      const p = new Person()
      p.body.mother = mother
      p.body.father = father
      p.body.hasPenis = false
      p.body.hasWomb = false
      p.gender = 'Woman'
      p.body.achondroplasia = false
      p.neurodivergent = false
      expect(Skills.getMagicalCalling(p, false)).toEqual(35)
    })

    it('returns 35 for a person of a special gender in a community that considers magic open', () => {
      const mother = new Person()
      const father = new Person()
      const p = new Person()
      p.body.mother = mother
      p.body.father = father
      p.body.hasPenis = false
      p.body.hasWomb = true
      p.gender = 'Third gender'
      p.body.achondroplasia = false
      p.neurodivergent = false
      expect(Skills.getMagicalCalling(p, false)).toEqual(35)
    })


    it('returns 35 for a dwarf in a community that considers magic open', () => {
      const mother = new Person()
      const father = new Person()
      const p = new Person()
      p.body.mother = mother
      p.body.father = father
      p.body.hasPenis = false
      p.body.hasWomb = true
      p.gender = 'Woman'
      p.body.achondroplasia = true
      p.neurodivergent = false
      expect(Skills.getMagicalCalling(p, false)).toEqual(35)
    })

    it('returns 35 for a neurodivergent person in a community that considers magic open', () => {
      const mother = new Person()
      const father = new Person()
      const p = new Person()
      p.body.mother = mother
      p.body.father = father
      p.body.hasPenis = false
      p.body.hasWomb = true
      p.gender = 'Woman'
      p.body.achondroplasia = false
      p.neurodivergent = true
      expect(Skills.getMagicalCalling(p, false)).toEqual(35)
    })

    it('returns 95 for a neurodivergent dwarf of a special gender in a community that considers magic open', () => {
      const mother = new Person()
      const father = new Person()
      const p = new Person()
      p.body.mother = mother
      p.body.father = father
      p.body.hasPenis = false
      p.body.hasWomb = true
      p.gender = 'Third gender'
      p.body.achondroplasia = true
      p.neurodivergent = true
      expect(Skills.getMagicalCalling(p, false)).toEqual(95)
    })
  })

  describe('pick', () => {
    it('picks a skill to start learning', () => {
      const c = new Community()
      const p = new Person()
      Skills.pick(p, c)
      expect(typeof p.skills.learning.skill).toEqual('string')
    })

    it('sets progress at zero', () => {
      const c = new Community()
      const p = new Person()
      Skills.pick(p, c)
      expect(p.skills.learning.progress).toEqual(0)
    })

    it('sets a number of years needed to master the skill', () => {
      const c = new Community()
      const p = new Person()
      Skills.pick(p, c)
      expect(p.skills.learning.needed).toBeLessThan(15)
    })

    it('is more likely to be the community\'s favored skill if you\'re more agreeable', () => {
      let control = 0
      let test = 0
      const skill = 'Acting'
      const c = new Community()
      c.traditions = { skill }
      const p = new Person()

      // Control group
      for (let i = 0; i < 100; i++) {
        Skills.pick(p, c)
        if (p.skills.learning.skill === skill) control++
      }

      // Test group
      p.personality.agreeableness.value = 3
      for (let i = 0; i < 100; i++) {
        Skills.pick(p, c)
        if (p.skills.learning.skill === skill) test++
      }

      expect(test).toBeGreaterThan(control)
    })
  })

  describe('advance', () => {
    it('increments progress', () => {
      const c = new Community()
      const p = new Person()
      Skills.pick(p, c)
      p.skills.advance()
      expect(p.skills.learning.progress).toEqual(1)
    })

    it('adds skill to mastered skills when it reaches the needed years', () => {
      const s = new Skills()
      s.learning = {
        skill: 'Acting',
        progress: 6,
        needed: 7
      }
      s.advance()
      expect(s.mastered).toEqual([ 'Acting' ])
    })

    it('sets learning to undefined when learning is done', () => {
      const s = new Skills()
      s.learning = {
        skill: 'Acting',
        progress: 6,
        needed: 7
      }
      s.advance()
      expect(s.learning).toEqual(undefined)
    })
  })
})
