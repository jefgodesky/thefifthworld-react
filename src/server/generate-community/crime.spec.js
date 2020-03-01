/* global describe, it, expect */

import Community from './community'
import Person from './person'

import {
  getCrimes,
  considerViolence,
  assaultOutcome,
  assault,
  evade
} from './crime'
import { allTrue } from '../../shared/utils'

describe('getCrimes', () => {
  it('returns a person\'s crimes', () => {
    const community = new Community()
    const a = new Person(community)
    const b = new Person(community)
    assault(a, b, community)
    expect(getCrimes(a)).toHaveLength(1)
  })

  it('doesn\'t include crimes you didn\'t commit', () => {
    const community = new Community()
    const a = new Person(community)
    const b = new Person(community)
    assault(a, b, community)
    expect(getCrimes(b)).toHaveLength(0)
  })

  it('counts an event that is both assault and murder as murder', () => {
    const p = new Person()
    p.history.add(p.present, { tags: [ 'crime', 'assault' ] })
    p.history.add(p.present, { tags: [ 'crime', 'murder', 'assault' ] })
    expect(getCrimes(p)).toEqual([ 'assault', 'murder' ])
  })
})

describe('considerViolence', () => {
  it('returns a string', () => {
    const p = new Person()
    expect(typeof considerViolence(p)).toEqual('string')
  })

  it('overwhelmingly returns no when dealing with random people', () => {
    const stats = { no: 0, kill: 0, attack: 0 }
    for (let i = 0; i < 100; i++) {
      const p = new Person()
      switch (considerViolence(p)) {
        case 'no': stats.no++; break
        case 'kill': stats.kill++; break
        case 'attack': stats.attack++; break
      }
    }
    expect(stats.no).toBeGreaterThan(90)
  })

  it('returns attack more often when dealing with more disagreeable people', () => {
    const stats = { no: 0, kill: 0, attack: 0 }
    for (let i = 0; i < 100; i++) {
      const p = new Person()
      p.personality.agreeableness = -2
      switch (considerViolence(p)) {
        case 'no': stats.no++; break
        case 'kill': stats.kill++; break
        case 'attack': stats.attack++; break
      }
    }
    expect(stats.no).toBeLessThan(90)
  })
})

describe('assaultOutcome', () => {
  it('returns a boolean', () => {
    const attacker = new Person()
    const defender = new Person()
    expect(typeof assaultOutcome(attacker, defender)).toEqual('boolean')
  })

  it('succeeds more than 25% of the time with average people', () => {
    let count = 0
    for (let i = 0; i < 100; i++) {
      const attacker = new Person()
      const defender = new Person()
      if (assaultOutcome(attacker, defender)) count++
    }
    expect(count).toBeGreaterThan(25)
  })

  it('succeeds less than 75% of the time with average people', () => {
    let count = 0
    for (let i = 0; i < 100; i++) {
      const attacker = new Person()
      const defender = new Person()
      if (assaultOutcome(attacker, defender)) count++
    }
    expect(count).toBeLessThan(75)
  })

  it('succeeds more often when the attacker has more deadly skills', () => {
    let count = 0
    for (let i = 0; i < 100; i++) {
      const attacker = new Person()
      const defender = new Person()
      attacker.skills.mastered.push('Deception', 'Running', 'Scouting', 'Archery')
      if (assaultOutcome(attacker, defender)) count++
    }
    expect(count).toBeGreaterThan(75)
  })

  it('succeeds less often when the defender is properly skilled', () => {
    let count = 0
    for (let i = 0; i < 100; i++) {
      const attacker = new Person()
      const defender = new Person()
      defender.skills.mastered.push('Running', 'Scouting')
      if (assaultOutcome(attacker, defender)) count++
    }
    expect(count).toBeLessThan(50)
  })
})

describe('assault', () => {
  it('adds record to the attacker\'s history', () => {
    const community = new Community()
    const attacker = new Person(community)
    const defender = new Person(community)
    assault(attacker, defender, community)
    const records = attacker.history.get({ tag: 'assault' })
    expect(records).toHaveLength(1)
  })

  it('adds record to the defender\'s history', () => {
    const community = new Community()
    const attacker = new Person(community)
    const defender = new Person(community)
    assault(attacker, defender, community)
    const records = defender.history.get({ tag: 'assault' })
    expect(records).toHaveLength(1)
  })

  it('is sometimes lethal', () => {
    let count = 0
    for (let i = 0; i < 1000; i++) {
      const community = new Community()
      const attacker = new Person(community)
      const defender = new Person(community)
      assault(attacker, defender, community)
      if (defender.died) count++
    }
    expect(count).toBeGreaterThan(0)
  })

  it('is more often lethal when you attack with lethal intent', () => {
    let count = 0
    for (let i = 0; i < 100; i++) {
      const community = new Community()
      const attacker = new Person(community)
      const defender = new Person(community)
      assault(attacker, defender, community, true)
      if (defender.died) count++
    }
    expect(count).toBeGreaterThan(25)
  })

  it('can return a report', () => {
    const community = new Community()
    const attacker = new Person(community)
    const defender = new Person(community)
    const report = assault(attacker, defender, community, true, true)
    expect(report.tags).toContain('assault')
  })

  it('doesn\'t add to personal histories if it returns a report', () => {
    const community = new Community()
    const attacker = new Person(community)
    const defender = new Person(community)
    assault(attacker, defender, community, true, true)
    const checks = [
      attacker.history.get({ tag: 'assault' }).length === 0,
      defender.history.get({ tag: 'assault' }).length === 0
    ]
    expect(allTrue(checks)).toEqual(true)
  })
})

describe('evade', () => {
  it('returns a boolean', () => {
    const p = new Person()
    expect(typeof evade(p)).toEqual('boolean')
  })

  it('succeeds more than 25% of the time with ordinary people', () => {
    let count = 0
    for (let i = 0; i < 100; i++) {
      const p = new Person()
      if (evade(p)) count++
    }
    expect(count).toBeGreaterThan(25)
  })

  it('succeeds less than 75% of the time with ordinary people', () => {
    let count = 0
    for (let i = 0; i < 100; i++) {
      const p = new Person()
      if (evade(p)) count++
    }
    expect(count).toBeLessThan(75)
  })

  it('succeeds less often with a more in-depth investigation', () => {
    let count = 0
    for (let i = 0; i < 100; i++) {
      const p = new Person()
      if (evade(p, 10)) count++
    }
    expect(count).toBeLessThan(50)
  })

  it('succeeds more often if you\'re a skilled liar', () => {
    let count = 0
    for (let i = 0; i < 100; i++) {
      const p = new Person()
      p.skills.mastered.push('Deception')
      if (evade(p)) count++
    }
    expect(count).toBeGreaterThan(33)
  })

  it('succeeds more often if you\'re more Machiavellian', () => {
    let count = 0
    for (let i = 0; i < 100; i++) {
      const p = new Person()
      p.intelligence = 1
      p.personality.agreeableness = -1
      if (evade(p)) count++
    }
    expect(count).toBeGreaterThan(33)
  })
})
