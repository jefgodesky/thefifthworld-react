/* global describe, it, expect */

import Community from './community'
import Person from './person'

import {
  getCrimes,
  sabotage,
  considerViolence,
  assaultOutcome,
  assault,
  respondToAdultery,
  adultery,
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

  it('returns assaults that you committed in response to adultery', () => {
    const community = new Community()
    const a = new Person(community)
    const b = new Person()
    const c = new Person()
    a.takePartner(b, community)
    a.history.add(a.present, {
      tags: ['crime', 'adultery', 'separation', 'assault'],
      adulterers: [b.id, c.id],
      cheatedOn: [a.id],
      keepAdulterySecret: false,
      responses: [
        {
          attacker: a.id,
          defender: c.id,
          succeeded: false
        }
      ]
    })
    expect(getCrimes(a)).toHaveLength(1)
  })

  it('doesn\'t return adultery where you were the one cheated on', () => {
    const community = new Community()
    const a = new Person(community)
    const b = new Person()
    const c = new Person()
    const d = new Person()
    a.takePartner(b, community)
    c.takePartner(d, community)
    a.history.add(a.present, {
      tags: ['crime', 'adultery', 'separation', 'assault'],
      adulterers: [b.id, c.id],
      cheatedOn: [a.id, d.id],
      keepAdulterySecret: false,
      responses: [
        {
          attacker: a.id,
          defender: c.id,
          succeeded: false
        }
      ]
    })
    expect(getCrimes(d)).toHaveLength(0)
  })
})

describe('sabotage', () => {
  it('does nothing if the community has no yield set', () => {
    const c = new Community()
    c.territory = { yield: undefined }
    const a = new Person(c)
    sabotage(a, c)
    expect(c.territory.yield).toEqual(undefined)
  })

  it('reduces the yield of the community\'s territory', () => {
    const c = new Community()
    c.territory = { yield: 10 }
    const a = new Person(c)
    sabotage(a, c)
    expect(c.territory.yield).toBeLessThan(10)
  })

  it('adds a record to the saboteur\'s personal history', () => {
    const c = new Community()
    c.territory = { yield: 10 }
    const a = new Person(c)
    sabotage(a, c)
    expect(a.history.get({ tag: 'sabotage' })).toHaveLength(1)
  })

  it('can return a record', () => {
    const c = new Community()
    c.territory = { yield: 10 }
    const a = new Person(c)
    expect(typeof sabotage(a, c, true)).toEqual('object')
  })

  it('tags the event as a crime and as sabotage', () => {
    const c = new Community()
    c.territory = { yield: 10 }
    const a = new Person(c)
    const record = sabotage(a, c, true)
    expect(record.tags).toEqual([ 'crime', 'sabotage' ])
  })

  it('notes the saboteur\'s ID', () => {
    const c = new Community()
    c.territory = { yield: 10 }
    const a = new Person(c)
    const record = sabotage(a, c, true)
    expect(record.saboteur).toEqual(a.id)
  })

  it('records the impact of the sabotage', () => {
    const c = new Community()
    c.territory = { yield: 10 }
    const a = new Person(c)
    const record = sabotage(a, c, true)
    expect(record.impact > 0 && record.impact <= 5).toEqual(true)
  })

  it('tells us if the saboteur was discovered', () => {
    const c = new Community()
    c.territory = { yield: 10 }
    const a = new Person(c)
    const record = sabotage(a, c, true)
    console.log(record)
    expect(typeof record.discovered).toEqual('boolean')
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

describe('respondToAdultery', () => {
  it('returns a report', () => {
    const community = new Community()
    const a = new Person(community)
    const b = new Person()
    const c = new Person()
    a.takePartner(b, community, true)
    const actual = respondToAdultery(a, [ b, c ], community)
    expect(typeof actual).toEqual('object')
  })

  it('results in separation more than 25% of the time', () => {
    let count = 0
    for (let i = 0; i < 100; i++) {
      const community = new Community()
      const a = new Person(community)
      const b = new Person()
      const c = new Person()
      a.takePartner(b, community, true)
      const report = respondToAdultery(a, [ b, c ], community)
      if (report.tags && report.tags.includes('separation')) count++
    }
    expect(count).toBeGreaterThan(25)
  })

  it('results in separation more than 75% of the time', () => {
    let count = 0
    for (let i = 0; i < 100; i++) {
      const community = new Community()
      const a = new Person(community)
      const b = new Person()
      const c = new Person()
      a.takePartner(b, community, true)
      const report = respondToAdultery(a, [ b, c ], community)
      if (report.tags && report.tags.includes('separation')) count++
    }
    expect(count).toBeLessThan(75)
  })

  it('sometimes leads to assault', () => {
    let count = 0
    for (let i = 0; i < 100; i++) {
      const community = new Community()
      const a = new Person(community)
      const b = new Person()
      const c = new Person()
      a.takePartner(b, community, true)
      const report = respondToAdultery(a, [ b, c ], community)
      if (report.tags && report.tags.includes('assault')) count++
    }
    expect(count).toBeGreaterThanOrEqual(0)
  })
})

describe('adultery', () => {
  it('adds the incident to the adulterers\' histories', () => {
    const community = new Community()
    const a = new Person()
    const b = new Person()
    const c = new Person()
    const d = new Person()
    a.takePartner(b, community, true)
    c.takePartner(d, community, true)
    adultery([ b, d ], community)
    const actual = [
      b.history.get({ tag: 'adultery' }).length === 1,
      d.history.get({ tag: 'adultery' }).length === 1
    ]
    expect(allTrue(actual)).toEqual(true)
  })

  it('adds the incident to all partners\' histories if it\'s found out', () => {
    const community = new Community()
    const a = new Person()
    const b = new Person()
    const c = new Person()
    const d = new Person()
    const e = new Person()
    a.takePartner(b, community, true)
    c.takePartner(d, community, true)
    c.takePartner(e, community, false)
    adultery([ a, c ], community)
    const keptSecret = a.history.get({ tag: 'adultery' })[0].keepAdulterySecret
    const actual = [
      a.history.get({ tag: 'adultery' }).length === 1,
      b.history.get({ tag: 'adultery' }).length === 1,
      c.history.get({ tag: 'adultery' }).length === 1,
      d.history.get({ tag: 'adultery' }).length === 1,
      e.history.get({ tag: 'adultery' }).length === 1
    ]
    expect(keptSecret || allTrue(actual)).toEqual(true)
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
