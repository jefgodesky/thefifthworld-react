/* global describe, it, expect */

import Community from './community'
import Person from './person'
import Polycule from './polycule'

import { allTrue, isPopulatedArray } from '../../shared/utils'

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

    it('establishes a present', () => {
      const p = new Person({ born: 2020 })
      expect(p.present).toEqual(2020)
    })

    it('includes infant mortality', () => {
      let infantMortality = 0
      for (let i = 0; i < 100; i++) {
        const mom = new Person()
        mom.genotype.hasWomb = true
        mom.genotype.hasPenis = false

        const dad = new Person()
        dad.genotype.hasWomb = false
        dad.genotype.hasPenis = true

        const baby = new Person({ parents: [ mom.genotype, dad.genotype ], born: 2020 })
        if (baby.died) infantMortality++
      }
      expect(infantMortality).toBeGreaterThan(0)
    })

    it('adds a birth entry', () => {
      const mom = new Person()
      mom.genotype.hasWomb = true
      mom.genotype.hasPenis = false

      const dad = new Person()
      dad.genotype.hasWomb = false
      dad.genotype.hasPenis = true

      const baby = new Person({ parents: [ mom.genotype, dad.genotype ], born: 2020 })
      expect(baby.history.get({ tags: [ 'born' ] }).length).toEqual(1)
    })

    it('starts you off with 0 murders', () => {
      const p = new Person()
      expect(p.crimes.murders.committed).toEqual(0)
    })

    it('starts you off with 0 attempted murders', () => {
      const p = new Person()
      expect(p.crimes.murders.attempted).toEqual(0)
    })

    it('starts you off with 0 incidents of sabotage', () => {
      const p = new Person()
      expect(p.crimes.sabotage).toEqual(0)
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

    it('assigns an attraction matrix', () => {
      const p = new Person()
      const { attraction } = p
      const tests = [
        attraction.length === 6,
        attraction[0].event === 'attractiveness',
        attraction[1].event === 'openness',
        attraction[2].event === 'conscientiousness',
        attraction[3].event === 'extraversion',
        attraction[4].event === 'agreeableness',
        attraction[5].event === 'neuroticism',
        attraction.reduce((acc, curr) => acc + curr.chance, 0) === 100
      ]
      expect(allTrue(tests)).toEqual(true)
    })
  })

  describe('getAttraction', () => {
    it('returns a table of attraction priorities', () => {
      const p = new Person()
      const attraction = p.getAttraction()
      const actual = [
        attraction.length === 6,
        attraction[0].event === 'attractiveness',
        attraction[1].event === 'openness',
        attraction[2].event === 'conscientiousness',
        attraction[3].event === 'extraversion',
        attraction[4].event === 'agreeableness',
        attraction[5].event === 'neuroticism',
        attraction.reduce((acc, curr) => acc + curr.chance, 0) === 100
      ]
      expect(allTrue(actual)).toEqual(true)
    })
  })

  describe('encounter', () => {
    it('returns an object', () => {
      const a = new Person()
      const b = new Person()
      const actual = a.encounter(b)
      expect(typeof actual).toEqual('object')
    })

    it('returns a boolean for if this person liked the other', () => {
      const a = new Person()
      const b = new Person()
      const actual = a.encounter(b)
      expect(typeof actual.self).toEqual('boolean')
    })

    it('returns a boolean for if the other liked this person', () => {
      const a = new Person()
      const b = new Person()
      const actual = a.encounter(b)
      expect(typeof actual.other).toEqual('boolean')
    })

    it('returns a boolean for if they both liked each other', () => {
      const a = new Person()
      const b = new Person()
      const actual = a.encounter(b)
      expect(actual.self && actual.other).toEqual(actual.mutual)
    })

    it('returns false if not given a person', () => {
      const a = new Person()
      expect(a.encounter('nope')).toEqual(false)
    })

    it('factors in attractiveness', () => {
      const matrix = [
        { chance: 100, event: 'attractiveness' },
        { chance: 0, event: 'openness' },
        { chance: 0, event: 'conscientiousness' },
        { chance: 0, event: 'extraversion' },
        { chance: 0, event: 'agreeableness' },
        { chance: 0, event: 'neuroticism' }
      ]

      let count = 0
      for (let i = 0; i < 100; i++) {
        const a = new Person()
        a.body.attractiveness = 3
        a.attraction = matrix

        const b = new Person()
        b.body.attractiveness = 3
        b.attraction = matrix

        const res = a.encounter(b)
        if (res.mutual) count++
      }

      expect(count).toBeGreaterThanOrEqual(75)
    })

    it('factors in openness to new experience', () => {
      const matrix = [
        { chance: 0, event: 'attractiveness' },
        { chance: 100, event: 'openness' },
        { chance: 0, event: 'conscientiousness' },
        { chance: 0, event: 'extraversion' },
        { chance: 0, event: 'agreeableness' },
        { chance: 0, event: 'neuroticism' }
      ]

      let count = 0
      for (let i = 0; i < 100; i++) {
        const a = new Person()
        a.personality.openness.value = 3
        a.attraction = matrix

        const b = new Person()
        b.personality.openness.value = 3
        b.attraction = matrix

        const res = a.encounter(b)
        if (res.mutual) count++
      }

      expect(count).toBeGreaterThanOrEqual(75)
    })

    it('factors in conscientiousness', () => {
      const matrix = [
        { chance: 0, event: 'attractiveness' },
        { chance: 0, event: 'openness' },
        { chance: 100, event: 'conscientiousness' },
        { chance: 0, event: 'extraversion' },
        { chance: 0, event: 'agreeableness' },
        { chance: 0, event: 'neuroticism' }
      ]

      let count = 0
      for (let i = 0; i < 100; i++) {
        const a = new Person()
        a.personality.conscientiousness.value = 3
        a.attraction = matrix

        const b = new Person()
        b.personality.conscientiousness.value = 3
        b.attraction = matrix

        const res = a.encounter(b)
        if (res.mutual) count++
      }

      expect(count).toBeGreaterThanOrEqual(75)
    })

    it('factors in extraversion', () => {
      const matrix = [
        { chance: 0, event: 'attractiveness' },
        { chance: 0, event: 'openness' },
        { chance: 0, event: 'conscientiousness' },
        { chance: 100, event: 'extraversion' },
        { chance: 0, event: 'agreeableness' },
        { chance: 0, event: 'neuroticism' }
      ]

      let count = 0
      for (let i = 0; i < 100; i++) {
        const a = new Person()
        a.personality.extraversion.value = 3
        a.attraction = matrix

        const b = new Person()
        b.personality.extraversion.value = 3
        b.attraction = matrix

        const res = a.encounter(b)
        if (res.mutual) count++
      }

      expect(count).toBeGreaterThanOrEqual(75)
    })

    it('factors in agreeableness', () => {
      const matrix = [
        { chance: 0, event: 'attractiveness' },
        { chance: 0, event: 'openness' },
        { chance: 0, event: 'conscientiousness' },
        { chance: 0, event: 'extraversion' },
        { chance: 100, event: 'agreeableness' },
        { chance: 0, event: 'neuroticism' }
      ]

      let count = 0
      for (let i = 0; i < 100; i++) {
        const a = new Person()
        a.personality.agreeableness.value = 3
        a.attraction = matrix

        const b = new Person()
        b.personality.agreeableness.value = 3
        b.attraction = matrix

        const res = a.encounter(b)
        if (res.mutual) count++
      }

      expect(count).toBeGreaterThanOrEqual(75)
    })

    it('factors in emotional stability', () => {
      const matrix = [
        { chance: 0, event: 'attractiveness' },
        { chance: 0, event: 'openness' },
        { chance: 0, event: 'conscientiousness' },
        { chance: 0, event: 'extraversion' },
        { chance: 0, event: 'agreeableness' },
        { chance: 100, event: 'neuroticism' }
      ]

      let count = 0
      for (let i = 0; i < 100; i++) {
        const a = new Person()
        a.personality.neuroticism.value = -3
        a.attraction = matrix

        const b = new Person()
        b.personality.neuroticism.value = -3
        b.attraction = matrix

        const res = a.encounter(b)
        if (res.mutual) count++
      }

      expect(count).toBeGreaterThanOrEqual(75)
    })

    it('can be assymetrical', () => {
      let count = 0
      for (let i = 0; i < 100; i++) {
        const a = new Person()
        a.personality.agreeableness.value = 3
        a.attraction = [
          { chance: 100, event: 'attractiveness' },
          { chance: 0, event: 'openness' },
          { chance: 0, event: 'conscientiousness' },
          { chance: 0, event: 'extraversion' },
          { chance: 0, event: 'agreeableness' },
          { chance: 0, event: 'neuroticism' }
        ]

        const b = new Person()
        b.body.attractiveness = 3
        b.attraction = [
          { chance: 0, event: 'attractiveness' },
          { chance: 0, event: 'openness' },
          { chance: 0, event: 'conscientiousness' },
          { chance: 0, event: 'extraversion' },
          { chance: 100, event: 'agreeableness' },
          { chance: 0, event: 'neuroticism' }
        ]

        const res = a.encounter(b)
        if (res.mutual) count++
      }

      expect(count).toBeGreaterThanOrEqual(75)
    })
  })

  describe('meet', () => {
    it('might start a relationship', () => {
      const p = new Person()
      const s = new Person()
      p.meet(s)
      const no = p.polycule === undefined
      const yes = Boolean(p.polycule) && p.polycule.people.includes(p) && p.polycule.people.includes(s) && p.polycule.people.length === 2
      expect(yes || no).toEqual(true)
    })

    it('might expand the polycule', () => {
      const a = new Person()
      const b = new Person()
      const c = new Person()
      const p = new Polycule(a, b)
      p.commit()
      a.meet(c)
      const no = p.people.length === 2
      const yes = p.people.length === 3
      expect(yes || no).toEqual(true)
    })
  })

  describe('die', () => {
    it('marks the character as dead', () => {
      const now = new Date()
      const year = now.getFullYear()
      const p = new Person()
      p.die()
      expect(p.died).toEqual(year)
    })

    it('adds it to the character\'s history', () => {
      const p = new Person()
      p.die()
      expect(p.history.get({ tags: [ 'died' ] }).length).toEqual(1)
    })

    it('records the cause of death', () => {
      const p = new Person()
      p.die()
      expect(p.history.get({ tags: [ 'died' ] })[0].cause).toEqual('natural')
    })

    it('records the killer (if you were killed)', () => {
      const p = new Person()
      const killer = new Person()
      p.die('homicide', killer)
      expect(p.history.get({ tags: [ 'died' ] })[0].killer).toEqual(killer)
    })
  })

  describe('leave', () => {
    it('marks that the character left the community', () => {
      const now = new Date()
      const year = now.getFullYear()
      const p = new Person()
      p.leave()
      expect(p.left).toEqual(year)
    })

    it('adds it to the character\'s history', () => {
      const p = new Person()
      p.leave()
      expect(p.history.get({ tags: [ 'left' ] }).length).toEqual(1)
    })

    it('records if the person was exiled', () => {
      const p = new Person()
      p.leave('wasting perfectly good pickles')
      expect(p.history.get({ tags: [ 'exile' ] }).length).toEqual(1)
    })

    it('records the crime for which the person was exiled', () => {
      const p = new Person()
      const crime = 'wasting perfectly good pickles'
      p.leave(crime)
      expect(p.history.get({ tags: [ 'exile' ] })[0].crime).toEqual(crime)
    })
  })

  describe('getAge', () => {
    it('calculates age based on the character\'s present', () => {
      const p = new Person({ born: 2020 })
      p.present = 2040
      expect(p.getAge()).toEqual(20)
    })

    it('calculates age based on the year provided', () => {
      const p = new Person({ born: 2020 })
      p.present = 2040
      expect(p.getAge(2030)).toEqual(10)
    })

    it('calculates age based on the year the character left', () => {
      const p = new Person({ born: 2020 })
      p.present = 2040
      p.left = 2035
      expect(p.getAge()).toEqual(15)
    })

    it('calculates age based on the year the character died', () => {
      const p = new Person({ born: 2020 })
      p.present = 2040
      p.died = 2035
      expect(p.getAge()).toEqual(15)
    })
  })

  describe('getHurt', () => {
    it('records the injury', () => {
      const p = new Person()
      p.getHurt()
      expect(p.history.get({ tag: 'injury' }).length).toEqual(1)
    })

    it('records special tags', () => {
      const p = new Person()
      p.getHurt([ 'in conflict' ])
      expect(p.history.get({ tag: 'in conflict' }).length).toEqual(1)
    })
  })

  describe('getSick', () => {
    it('records the illness', () => {
      const p = new Person()
      p.getSick()
      expect(p.history.get({ tag: 'illness' }).length).toEqual(1)
    })

    it('records special tags', () => {
      const p = new Person()
      p.getSick([ 'from sickness' ])
      expect(p.history.get({ tag: 'from sickness' }).length).toEqual(1)
    })
  })

  describe('feelsSafe', () => {
    it('returns true if things have been peaceful', () => {
      const today = new Date()
      const year = today.getFullYear()
      const c = new Community()
      c.present = year + 100
      for (let y = year; y < year + 100; y++) {
        c.history.add({ year: y, lean: false, sick: false, conflict: false })
      }

      const p = new Person()
      c.add(p)
      expect(p.feelsSafe()).toEqual(true)
    })

    it('returns false if you\'ve experienced lean times recently', () => {
      const today = new Date()
      const year = today.getFullYear()
      const c = new Community()
      c.present = year + 101
      for (let y = year; y < year + 100; y++) {
        c.history.add({ year: y, lean: false, sick: false, conflict: false })
      }
      c.history.add({ year: year + 101, lean: true, sick: false, conflict: false })

      const p = new Person()
      c.add(p)
      expect(p.feelsSafe()).toEqual(false)
    })

    it('returns false if you\'ve experienced widespread sickness recently', () => {
      const today = new Date()
      const year = today.getFullYear()
      const c = new Community()
      c.present = year + 101
      for (let y = year; y < year + 100; y++) {
        c.history.add({ year: y, lean: false, sick: false, conflict: false })
      }
      c.history.add({ year: year + 101, lean: false, sick: true, conflict: false })

      const p = new Person()
      c.add(p)
      expect(p.feelsSafe()).toEqual(false)
    })

    it('returns false if you\'ve been in a conflict recently', () => {
      const today = new Date()
      const year = today.getFullYear()
      const c = new Community()
      c.present = year + 101
      for (let y = year; y < year + 100; y++) {
        c.history.add({ year: y, lean: false, sick: false, conflict: false })
      }
      c.history.add({ year: year + 101, lean: false, sick: false, conflict: true })

      const p = new Person()
      c.add(p)
      expect(p.feelsSafe()).toEqual(false)
    })

    it('requires fewer peaceful years if you\'re more open', () => {
      const c = new Community()
      c.present = 2321
      c.history.add({ year: 2320, lean: false, sick: false, conflict: true })
      c.history.add({ year: 2321, lean: false, sick: false, conflict: false })

      const p = new Person()
      p.personality.openness.value = 3
      c.add(p)
      expect(p.feelsSafe()).toEqual(true)
    })

    it('requires more peaceful years if you\'re less open', () => {
      const c = new Community()
      c.present = 2326
      c.history.add({ year: 2320, lean: false, sick: false, conflict: true })
      c.history.add({ year: 2321, lean: false, sick: false, conflict: false })
      c.history.add({ year: 2322, lean: false, sick: false, conflict: false })
      c.history.add({ year: 2323, lean: false, sick: false, conflict: false })
      c.history.add({ year: 2324, lean: false, sick: false, conflict: false })
      c.history.add({ year: 2325, lean: false, sick: false, conflict: false })
      c.history.add({ year: 2326, lean: false, sick: false, conflict: false })

      const p = new Person()
      p.personality.openness.value = 0
      c.add(p)
      expect(p.feelsSafe()).toEqual(true)
    })
  })

  describe('murder', () => {
    it('kills the victim', () => {
      const today = new Date()
      const murderer = new Person()
      const victim = new Person()
      murderer.murder([ victim ])
      expect(victim.died).toEqual(today.getFullYear())
    })

    it('can kill multiple victims', () => {
      const today = new Date()
      const murderer = new Person()
      const victim1 = new Person()
      const victim2 = new Person()
      murderer.murder([ victim1, victim2 ])
      const killedVictim1 = victim1.died === today.getFullYear()
      const killedVictim2 = victim2.died === today.getFullYear()
      expect(killedVictim1 && killedVictim2).toEqual(true)
    })

    it('keeps a list of people you\'ve murdered', () => {
      const murderer = new Person()
      const victim1 = new Person()
      const victim2 = new Person()
      const victim3 = new Person()
      murderer.murder([ victim1 ])
      murderer.murder([ victim2, victim3 ])
      expect(murderer.crimes.murders.killed).toEqual([ victim1, victim2, victim3 ])
    })

    it('does not kill attempted victims', () => {
      const murderer = new Person()
      const victim = new Person()
      murderer.murder([], [ victim ])
      expect(victim.died).toEqual(undefined)
    })

    it('can handle multiple attempted victims', () => {
      const murderer = new Person()
      const victim1 = new Person()
      const victim2 = new Person()
      murderer.murder([], [ victim1, victim2 ])
      const didNotKillVictim1 = victim1.died === undefined
      const didNotKillVictim2 = victim2.died === undefined
      expect(didNotKillVictim1 && didNotKillVictim2).toEqual(true)
    })

    it('keeps a list of people you\'ve tried to murder', () => {
      const murderer = new Person()
      const victim1 = new Person()
      const victim2 = new Person()
      const victim3 = new Person()
      murderer.murder([], [ victim1 ])
      murderer.murder([], [ victim2, victim3 ])
      expect(murderer.crimes.murders.attempted).toEqual([ victim1, victim2, victim3 ])
    })

    it('updates the victim\'s history with the year', () => {
      const today = new Date()
      const year = today.getFullYear()
      const murderer = new Person()
      const victim = new Person()
      murderer.murder([ victim ])
      expect(victim.history.get({ year, tags: [ 'died' ] }).length).toEqual(1)
    })

    it('updates the victim\'s history with the cause of death as homicide', () => {
      const today = new Date()
      const year = today.getFullYear()
      const murderer = new Person()
      const victim = new Person()
      murderer.murder([ victim ])
      const history = victim.history.get({ year, tags: [ 'died' ] })
      const entry = isPopulatedArray(history) ? history[0] : false
      expect(entry && entry.cause === 'homicide').toEqual(true)
    })

    it('updates the victim\'s history with the killer', () => {
      const today = new Date()
      const year = today.getFullYear()
      const murderer = new Person()
      const victim = new Person()
      murderer.murder([ victim ])
      const history = victim.history.get({ year, tags: [ 'died' ] })
      const entry = isPopulatedArray(history) ? history[0] : false
      expect(entry && entry.killer === murderer).toEqual(true)
    })

    it('updates the attempted victim\'s history', () => {
      const today = new Date()
      const year = today.getFullYear()
      const murderer = new Person()
      const victim = new Person()
      murderer.murder([], [ victim ])
      expect(victim.history.get({ year, tags: [ 'victim' ] }).length).toEqual(1)
    })

    it('updates the attempted victim\'s history with the crime', () => {
      const today = new Date()
      const year = today.getFullYear()
      const murderer = new Person()
      const victim = new Person()
      murderer.murder([], [ victim ])
      expect(victim.history.get({ year, tags: [ 'attempted murder' ] }).length).toEqual(1)
    })

    it('updates the attempted victim\'s history with the attempted killer', () => {
      const today = new Date()
      const year = today.getFullYear()
      const murderer = new Person()
      const victim = new Person()
      murderer.murder([], [ victim ])
      const history = victim.history.get({ year, tags: [ 'attempted murder' ] })
      const entry = isPopulatedArray(history) ? history[0] : false
      expect(entry && entry.perpetrator === murderer).toEqual(true)
    })

    it('updates the murderer\'s history', () => {
      const today = new Date()
      const year = today.getFullYear()
      const murderer = new Person()
      const victim = new Person()
      murderer.murder([ victim ])
      expect(murderer.history.get({ year, tags: [ 'crime' ] }).length).toEqual(1)
    })

    it('notes that the murderer is the perpetrator', () => {
      const today = new Date()
      const year = today.getFullYear()
      const murderer = new Person()
      const victim = new Person()
      murderer.murder([ victim ])
      expect(murderer.history.get({ year, tags: [ 'perpetrator' ] }).length).toEqual(1)
    })

    it('updates the murderer\'s history with the murder', () => {
      const today = new Date()
      const year = today.getFullYear()
      const murderer = new Person()
      const victim = new Person()
      murderer.murder([ victim ])
      expect(murderer.history.get({ year, tags: [ 'murder' ] }).length).toEqual(1)
    })

    it('updates the murderer\'s history with the attempted murder', () => {
      const today = new Date()
      const year = today.getFullYear()
      const murderer = new Person()
      const victim = new Person()
      murderer.murder([], [ victim ])
      expect(murderer.history.get({ year, tags: [ 'attempted murder' ] }).length).toEqual(1)
    })

    it('notes the victims in the murderer\'s history', () => {
      const today = new Date()
      const year = today.getFullYear()
      const murderer = new Person()
      const victim = new Person()
      murderer.murder([ victim ])
      const history = murderer.history.get({ year, tags: [ 'murder' ] })
      const entry = isPopulatedArray(history) ? history[0] : false
      expect(entry.victims).toEqual([ victim ])
    })

    it('notes the attempted victims in the murderer\'s history', () => {
      const today = new Date()
      const year = today.getFullYear()
      const murderer = new Person()
      const victim = new Person()
      murderer.murder([], [ victim ])
      const history = murderer.history.get({ year, tags: [ 'attempted murder' ] })
      const entry = isPopulatedArray(history) ? history[0] : false
      expect(entry.attempted).toEqual([ victim ])
    })
  })

  describe('age', () => {
    it('increments the character\'s present', () => {
      const p = new Person({ born: 2020 })
      p.age()
      expect(p.present).toEqual(2021)
    })

    it('won\'t let you live more than 10 years beyond your longevity', () => {
      const p = new Person({ born: 2020 })
      p.body.longevity = 100
      for (let i = 0; i < 120; i++) p.age()
      expect(p.died)
    })
  })
})
