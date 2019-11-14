/* global describe, it, expect */

import Person from './person'
import { clone } from '../../shared/utils'
import skills from '../../data/skills'

const isRandomlyDistributedNumber = n => {
  return typeof n === 'number' && n < 10 && n > -10
}

const isEmptyArray = arr => {
  return Array.isArray(arr) && arr.length === 0
}

describe('Person', () => {
  describe('random', () => {
    it('assigns longevity', () => {
      const p = new Person()
      expect(p.longevity).toBeGreaterThan(50)
    })

    it('generates a body', () => {
      const p = new Person()
      const actual = Object.keys(p.body)
      const expected = [
        'type', 'eyes', 'ears', 'arms', 'legs', 'scars', 'achondroplasia',
        'fertility', 'hasPenis', 'hasWomb'
      ]
      expect(actual).toEqual(expected)
    })

    it('sets eyes', () => {
      const p = new Person()
      const { left, right } = p.body.eyes
      const actual = (left === 'Blind' && right === 'Blind') || (left === 'Healthy' && right === 'Healthy')
      expect(actual).toEqual(true)
    })

    it('sets ears', () => {
      const p = new Person()
      const { left, right } = p.body.ears
      const actual = (left === 'Deaf' && right === 'Deaf') || (left === 'Healthy' && right === 'Healthy')
      expect(actual).toEqual(true)
    })

    it('sets arms', () => {
      const p = new Person()
      const { left, right } = p.body.arms
      const actual = [
        left === 'Disabled' || left === 'Healthy',
        right === 'Disabled' || right === 'Healthy'
      ]
      expect(actual.reduce((acc, curr) => acc && curr, true)).toEqual(true)
    })

    it('sets legs', () => {
      const p = new Person()
      const { left, right } = p.body.legs
      const actual = [
        left === 'Disabled' || left === 'Healthy',
        right === 'Disabled' || right === 'Healthy'
      ]
      expect(actual.reduce((acc, curr) => acc && curr, true)).toEqual(true)
    })

    it('initializes an array of scars', () => {
      const p = new Person()
      expect(isEmptyArray(p.body.scars)).toEqual(true)
    })

    it('sets achondroplasia', () => {
      const p = new Person()
      const { achondroplasia } = p.body
      expect(achondroplasia === true || achondroplasia === false).toEqual(true)
    })

    it('sets openness to experience', () => {
      const p = new Person()
      expect(isRandomlyDistributedNumber(p.personality.openness)).toEqual(true)
    })

    it('sets conscientiousness', () => {
      const p = new Person()
      expect(isRandomlyDistributedNumber(p.personality.conscientiousness)).toEqual(true)
    })

    it('sets extraversion', () => {
      const p = new Person()
      expect(isRandomlyDistributedNumber(p.personality.extraversion)).toEqual(true)
    })

    it('sets agreeableness', () => {
      const p = new Person()
      expect(isRandomlyDistributedNumber(p.personality.agreeableness)).toEqual(true)
    })

    it('sets neuroticism', () => {
      const p = new Person()
      expect(isRandomlyDistributedNumber(p.personality.neuroticism)).toEqual(true)
    })

    it('sets intelligence', () => {
      const p = new Person()
      expect(isRandomlyDistributedNumber(p.intelligence)).toEqual(true)
    })

    it('sets neurodivergence', () => {
      const p = new Person()
      expect(p.neurodivergent === true || p.neurodivergent === false).toEqual(true)
    })

    it('sets fertility to zero', () => {
      const p = new Person()
      expect(p.body.fertility).toEqual(0)
    })

    it('sets history to an empty array', () => {
      const p = new Person()
      expect(isEmptyArray(p.history)).toEqual(true)
    })

    it('sets partners to an empty array', () => {
      const p = new Person()
      expect(isEmptyArray(p.partners)).toEqual(true)
    })

    it('sets children to an empty array', () => {
      const p = new Person()
      expect(isEmptyArray(p.children)).toEqual(true)
    })

    it('sets mastered skills to an empty array', () => {
      const p = new Person()
      expect(isEmptyArray(p.skills.mastered)).toEqual(true)
    })

    it('can set a specific gender', () => {
      const p = new Person({ community: {}, year: 2019, gender: 'Woman' })
      expect(p.gender === 'Woman')
    })
  })

  describe('makePsychopath', () => {
    it('makes a person a psychopath', () => {
      let p = null
      while (!(p && !p.psychopath)) p = new Person()
      const before = clone(p.personality)

      p.makePsychopath()
      const after = clone(p.personality)

      const actual = [
        p.psychopath === 1,
        after.agreeableness === before.agreeableness - 2,
        after.conscientiousness === before.conscientiousness - 2,
        after.neuroticism === before.neuroticism + 2,
        after.extraversion === before.extraversion + 1,
        after.openness === before.openness + 1
      ]

      expect(actual.reduce((acc, curr) => acc && curr, true)).toEqual(true)
    })

    it('does nothing when the person is already a psychopath', () => {
      const p = new Person()
      p.makePsychopath()
      const before = clone(p.personality)
      p.makePsychopath()
      const after = clone(p.personality)

      expect(JSON.stringify(before)).toEqual(JSON.stringify(after))
    })
  })

  describe('chooseSex', () => {
    it('chooses sexual characteristics', () => {
      const p = new Person()
      const actual = [
        p.body.hasWomb === true || p.body.hasWomb === false,
        p.body.hasPenis === true || p.body.hasPenis === false
      ]
      expect(actual).toEqual([ true, true ])
    })
  })

  describe('assignGender', () => {
    it('assigns a gender', () => {
      const p = new Person()
      const binarySociety = [ 'Woman', 'Man' ]
      expect(binarySociety.includes(p.gender)).toEqual(true)
    })

    it('can pick from up to five genders', () => {
      const p = new Person({ community: { traditions: { genders: 5 } } })
      const fiveGenders = [
        'Feminine woman', 'Masculine woman', 'Fifth gender',
        'Feminine man', 'Masculine man'
      ]
      expect(fiveGenders.includes(p.gender)).toEqual(true)
    })
  })

  describe('adjustPersonality', () => {
    it('applies a personality adjustment', () => {
      const p = new Person()
      p.personality.openness = 0
      p.adjustPersonality('+openness')
      expect(p.personality.openness).toEqual(1)
    })

    it('won\'t drop a trait below -3', () => {
      const p = new Person()
      p.personality.openness = -2
      p.adjustPersonality('-openness')
      expect(p.personality.openness).toEqual(-3)
    })

    it('won\'t raise a trait above 3', () => {
      const p = new Person()
      p.personality.openness = 2
      p.adjustPersonality('+openness')
      expect(p.personality.openness).toEqual(3)
    })
  })

  describe('adjustFertility', () => {
    it('does nothing if the person has no birth year defined', () => {
      const p = new Person()
      const before = p.fertility
      p.adjustFertility(2019)
      expect(p.fertility).toEqual(before)
    })

    it('does nothing if the person is below 16', () => {
      const p = new Person()
      p.born = 2018
      const before = p.fertility
      p.adjustFertility(2019)
      expect(p.fertility).toEqual(before)
    })

    it('increases fertility for someone who is 20', () => {
      const p = new Person()
      p.born = 1999
      const before = p.body.fertility
      p.adjustFertility(2019)
      expect(p.body.fertility).toEqual(before + 20)
    })

    it('increases fertility for a male who is 60', () => {
      const p = new Person()
      p.born = 1959
      p.body.hasPenis = true
      p.body.hasWomb = false
      const before = p.body.fertility
      p.adjustFertility(2019)
      expect(p.body.fertility).toEqual(before + 20)
    })

    it('reduces fertility for a female who is 60', () => {
      const p = new Person()
      p.born = 1959
      p.body.hasPenis = false
      p.body.hasWomb = true
      p.body.fertility = 100
      p.adjustFertility(2019)
      expect(p.body.fertility).toEqual(80)
    })

    it('will not reduce fertility below 0', () => {
      const p = new Person()
      p.born = 1959
      p.body.hasPenis = false
      p.body.hasWomb = true
      p.body.fertility = 10
      p.adjustFertility(2019)
      expect(p.body.fertility).toEqual(0)
    })

    it('will not increase fertility above 100', () => {
      const p = new Person()
      p.born = 1999
      p.body.hasPenis = true
      p.body.hasWomb = false
      p.body.fertility = 90
      p.adjustFertility(2019)
      expect(p.body.fertility).toEqual(100)
    })
  })

  describe('die', () => {
    it('marks the character as dead', () => {
      const p = new Person()
      p.die()
      expect(p.died !== undefined).toEqual(true)
    })

    it('adds a death record if given a year', () => {
      const p = new Person()
      p.die('other', {}, 2019)
      const death = p.history.filter(entry => entry.year === 2019)
      expect(death.length).toBeGreaterThan(0)
    })

    it('adds an age of death if the person has a birth year recorded', () => {
      const p = new Person()
      p.born = 1959
      p.die('other', {}, 2019)
      const death = p.history.filter(entry => entry.year === 2019).pop()
      expect(death).toEqual({ year: 2019, entry: 'Died, age 60', tag: 'other' })
    })

    it('adds to the community discord', () => {
      const p = new Person()
      const community = { status: { discord: 0 } }
      p.die('other', community, 2019)
      expect(community.status.discord).toEqual(1)
    })
  })

  describe('takeRandomScar', () => {
    it('adds a random scar', () => {
      const p = new Person()
      p.takeRandomScar()
      expect(p.body.scars.length).toEqual(1)
    })

    it('will add to history if given a year', () => {
      const p = new Person()
      p.takeRandomScar(2019)
      const injury = p.history.filter(entry => entry.tag === 'injury').pop()
      expect(injury.year).toEqual(2019)
    })
  })

  describe('isGone', () => {
    it('describes missing as gone', () => {
      const p = new Person()
      p.body.arms.right = 'Missing'
      expect(p.isGone('arms', 'right')).toEqual(true)
    })

    it('describes disabled as gone', () => {
      const p = new Person()
      p.body.arms.right = 'Disabled'
      expect(p.isGone('arms', 'right')).toEqual(true)
    })

    it('describes deaf as gone', () => {
      const p = new Person()
      p.body.ears.right = 'Deaf'
      expect(p.isGone('ears', 'right')).toEqual(true)
    })

    it('describes blind as gone', () => {
      const p = new Person()
      p.body.eyes.right = 'Blind'
      expect(p.isGone('eyes', 'right')).toEqual(true)
    })

    it('does not describe healthy else as gone', () => {
      const p = new Person()
      p.body.arms.right = 'Healthy'
      expect(p.isGone('arms', 'right')).toEqual(false)
    })
  })

  describe('leftOrRight', () => {
    it('picks either the left or right', () => {
      const p = new Person()
      const actual = p.leftOrRight('arms')
      expect(actual === 'left' || actual === 'right').toEqual(true)
    })

    it('picks the left when the right is already impaired', () => {
      const p = new Person()
      p.body.arms.right = 'Missing'
      const actual = p.leftOrRight('arms')
      expect(actual).toEqual('left')
    })

    it('picks the right when the left is already impaired', () => {
      const p = new Person()
      p.body.arms.left = 'Missing'
      const actual = p.leftOrRight('arms')
      expect(actual).toEqual('right')
    })

    it('returns null when both are already impaired', () => {
      const p = new Person()
      p.body.arms.left = 'Missing'
      p.body.arms.right = 'Disabled'
      const actual = p.leftOrRight('arms')
      expect(actual).toEqual(null)
    })
  })

  describe('loseEarOrEye', () => {
    it('will pick left or right eye', () => {
      const p = new Person()
      p.body.eyes.left = 'Healthy'
      p.body.eyes.right = 'Healthy'
      p.loseEarOrEye('eyes')
      const { left, right } = p.body.eyes
      expect(left === 'Blind' || right === 'Blind').toEqual(true)
    })

    it('will note recovery if both sides are already disabled', () => {
      const p = new Person()
      p.body.eyes.left = 'Blind'
      p.body.eyes.right = 'Blind'
      p.loseEarOrEye('eyes', 'injury', 2019)
      const entry = p.history.filter(entry => entry.year === 2019).pop()
      expect(entry).toEqual({ year: 2019, entry: 'Suffered a head wound', tag: 'injury' })
    })

    it('will note if this resulted in total loss of faculty', () => {
      const p = new Person()
      p.body.eyes.left = 'Blind'
      p.loseEarOrEye('eyes', 'injury', 2019)
      const actual = p.history.filter(entry => entry.year === 2019).pop()
      const expected = {
        year: 2019,
        entry: 'Lost sight in right eye due to injury, resulting in total blindness',
        tag: 'injury'
      }
      expect(actual).toEqual(expected)
    })
  })

  describe('loseLimb', () => {
    it('will remove a limb', () => {
      const p = new Person()
      p.body.arms.left = 'Healthy'
      p.body.arms.right = 'Healthy'
      p.body.legs.left = 'Healthy'
      p.body.legs.right = 'Healthy'
      p.loseLimb()
      const { arms, legs } = p.body
      const actual = [ arms.left, arms.right, legs.left, legs.right ]
      const notExpected = [ 'Healthy', 'Healthy', 'Healthy', 'Healthy' ]
      expect(actual).not.toEqual(notExpected)
    })

    it('will note when it happened', () => {
      const p = new Person()
      p.loseLimb(2019)
      const injury = p.history.filter(entry => entry.tag === 'injury').pop()
      expect(injury.year).toEqual(2019)
    })
  })

  describe('getSick', () => {
    it('will make a character sick', () => {
      const p = new Person()
      p.getSick({}, 2019)
      expect(p.history.length).toEqual(1)
    })

    it('handles infection', () => {
      const p = new Person()
      p.getSick({}, 2019, true)
      const infections = p.history.filter(entry => entry.tag === 'infection')
      expect(infections.length).toEqual(1)
    })

    it('will delay her skill learning', () => {
      const p = new Person()
      p.skills.willMaster = 2019
      p.getSick()
      expect(p.skills.willMaster).toEqual(2020)
    })
  })

  describe('getHurt', () => {
    it('will injure a character', () => {
      const p = new Person()
      p.getHurt({}, 2019)
      expect(p.history.length).toEqual(1)
    })

    it('will delay her skill learning', () => {
      const p = new Person()
      p.skills.willMaster = 2019
      p.getHurt(2019)
      expect(p.skills.willMaster).toEqual(2020)
    })
  })

  describe('skillsToLearn', () => {
    it('returns a list of skills you can learn', () => {
      const p = new Person()
      const expected = skills.map(skill => skill.name).sort()
      const actual = p.skillsToLearn().sort()
      expect(actual).toEqual(expected)
    })

    it('can specialize', () => {
      const p = new Person()
      const main = 'Philosophy'
      p.skills.mastered = [ main ]
      const broad = skills.filter(skill => skill.name === main).pop()
      const expected = broad.specializations.map(skill => skill.name).sort()
      const actual = p.skillsToLearn({}, main).sort()
      expect(actual).toEqual(expected)
    })

    it('does not include skills you\'ve already mastered', () => {
      const p = new Person()
      const skillNames = skills.map(skill => skill.name)
      p.skills.mastered = [ skillNames[0] ]
      const learnable = p.skillsToLearn()
      const actual = !learnable.includes(skillNames[0]) && learnable.length === skillNames.length - 1
      expect(actual).toEqual(true)
    })

    it('can apply pressure to learn a skill encouraged by the community', () => {
      const community = { traditions: { skill: 'Communication' } }
      const p = new Person()
      p.personality.agreeableness = 2
      const actual = p.skillsToLearn(community).sort()
      const skillNames = skills.map(skill => skill.name)
      const expected = [ ...skillNames, 'Communication', 'Communication', 'Communication' ].sort()
      expect(actual).toEqual(expected)
    })

    it('makes it more likely to pick a skill that others in the community can teach you', () => {
      const community = { people: { teacher: { skills: { mastered: [ 'Communication' ] } } } }
      const p = new Person()
      const actual = p.skillsToLearn(community).sort()
      const skillNames = skills.map(skill => skill.name)
      const expected = [ ...skillNames, 'Communication' ].sort()
      expect(actual).toEqual(expected)
    })
  })

  describe('startLearning', () => {
    it('sets a new skill to learn', () => {
      const p = new Person()
      p.startLearning('React', 2019)
      expect(p.skills.learning).toEqual('React')
    })

    it('sets an initial estimate on when you\'ll master that new skill', () => {
      const p = new Person()
      p.intelligence = 0
      p.startLearning('React', 2019)
      expect(p.skills.willMaster).toEqual(2024)
    })
  })

  describe('pickNewSkill', () => {
    it('sets a new skill to learn', () => {
      const p = new Person()
      p.pickNewSkill({}, 2019)
      expect(p.skills.learning).not.toEqual(undefined)
    })

    it('sets an initial estimate on when you\'ll master that new skill', () => {
      const p = new Person()
      p.intelligence = 0
      p.pickNewSkill({}, 2019)
      expect(p.skills.willMaster).toEqual(2024)
    })
  })
})
