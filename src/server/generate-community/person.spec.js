/* global describe, it, expect */

import Community from './community'
import Person from './person'

describe('Person', () => {
  describe('constructor', () => {
    it('creates a genotype', () => {
      const p = new Person()
      expect(p.genotype.constructor.name).toEqual('Body')
    })

    it('creates a body', () => {
      const p = new Person()
      expect(p.body.constructor.name).toEqual('Body')
    })

    it('creates a personality', () => {
      const p = new Person()
      expect(p.personality.constructor.name).toEqual('Personality')
    })

    it('creates a sexuality', () => {
      const p = new Person()
      expect(p.sexuality.constructor.name).toEqual('Sexuality')
    })

    it('assigns a gender', () => {
      const genders = [
        'Feminine woman', 'Woman', 'Masculine woman',
        'Third gender', 'Fifth gender',
        'Feminine man', 'Man', 'Masculine man'
      ]
      const p = new Person()
      expect(genders.includes(p.gender))
    })

    it('assigns intelligence', () => {
      const p = new Person()
      expect(typeof p.intelligence).toEqual('number')
    })

    it('determines neurodivergence', () => {
      const p = new Person()
      expect(typeof p.neurodivergent).toEqual('boolean')
    })

    it('determines psychopathy', () => {
      const options = [ null, 1 ]
      const p = new Person()
      expect(options.includes(p.psychopath))
    })
  })

  describe('assignGender', () => {
    it('assigns a gender', () => {
      const genders = [ 'Woman', 'Third gender', 'Man' ]
      const p = new Person()
      p.gender = null
      p.assignGender()
      expect(genders.includes(p.gender))
    })

    it('assigns a gender in a four-gender system', () => {
      const genders = [
        'Feminine woman', 'Woman', 'Masculine woman',
        'Feminine man', 'Man', 'Masculine man'
      ]
      const p = new Person()
      p.gender = null
      p.assignGender(4)
      expect(genders.includes(p.gender))
    })

    it('assigns a gender in a five-gender system', () => {
      const genders = [
        'Feminine woman', 'Woman', 'Masculine woman', 'Fifth gender',
        'Feminine man', 'Man', 'Masculine man'
      ]
      const p = new Person()
      p.gender = null
      p.assignGender(4)
      expect(genders.includes(p.gender))
    })

    it('assigns a gender in a two-gender system', () => {
      const genders = [ 'Man', 'Woman' ]
      const p = new Person()
      p.gender = null
      p.assignGender(2)
      expect(genders.includes(p.gender))
    })
  })

  describe('makePsychopath', () => {
    it('tracks the severity of the psychopath\'s behavior', () => {
      const p = new Person()
      p.makePsychopath()
      expect(p.psychopath).toEqual(1)
    })

    it('does nothing if you\'re already a psychopath', () => {
      const p = new Person()
      p.makePsychopath()
      const before = [
        p.personality.openness.value,
        p.personality.conscientiousness.value,
        p.personality.extraversion.value,
        p.personality.agreeableness.value,
        p.personality.neuroticism.value
      ]
      p.makePsychopath()
      const after = [
        p.personality.openness.value,
        p.personality.conscientiousness.value,
        p.personality.extraversion.value,
        p.personality.agreeableness.value,
        p.personality.neuroticism.value
      ]
      expect(before).toEqual(after)
    })

    it('adjusts personality traits', () => {
      const p = new Person()
      p.personality.openness.value = 0
      p.personality.conscientiousness.value = 0
      p.personality.extraversion.value = 0
      p.personality.agreeableness.value = 0
      p.personality.neuroticism.value = 0
      p.makePsychopath()
      const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = p.personality
      const actual = [ openness.value, conscientiousness.value, extraversion.value, agreeableness.value, neuroticism.value ]
      const expected = [ 1, -2, 1, -2, 2 ]
      expect(actual).toEqual(expected)
    })
  })

  describe('die', () => {
    it('marks the character as dead', () => {
      const p = new Person()
      p.die()
      expect(p.died)
    })

    it('records the year the person died', () => {
      const p = new Person()
      p.die('natural', 2019)
      expect(p.died).toEqual(2019)
    })

    it('records an entry for the person\'s death', () => {
      const p = new Person()
      p.die()
      expect(p.history.length).toEqual(1)
    })

    it('tags the entry for the person\'s death', () => {
      const p = new Person()
      p.die()
      const arr = p.history.filter(e => e.event === 'died')
      expect(arr.length).toEqual(1)
    })

    it('records the cause of death', () => {
      const p = new Person()
      const cause = 'chocolate'
      p.die(cause)
      expect(p.history[0].cause).toEqual(cause)
    })
  })

  describe('age', () => {
    it('won\'t let you live more than 10 years beyond your longevity', () => {
      const p = new Person({ born: 1908 })
      const c = new Community()
      p.body.longevity = 100
      p.age(c, 2019)
      expect(p.died)
    })
  })
})
