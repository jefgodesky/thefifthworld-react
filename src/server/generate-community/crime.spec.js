/* global describe, it, expect */

import Person from './person'

import {
  considerViolence,
  assault
} from './crime'

describe('considerViolence', () => {
  it('returns a string', () => {
    const p = new Person()
    expect(typeof considerViolence(p)).toEqual('string')
  })

  it('overwhelmingly returns no when dealing with random people', () => {
    const stats = { no: 0, kill: 0, attack: 0 }
    for (let i = 0; i < 100; i++) {
      const p = new Person()
      switch (considerViolence(p)){
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
      switch (considerViolence(p)){
        case 'no': stats.no++; break
        case 'kill': stats.kill++; break
        case 'attack': stats.attack++; break
      }
    }
    expect(stats.no).toBeLessThan(90)
  })
})

describe('assault', () => {
  it('returns a boolean', () => {
    const attacker = new Person()
    const defender = new Person()
    expect(typeof assault(attacker, defender)).toEqual('boolean')
  })

  it('succeeds more than 25% of the time with average people', () => {
    let count = 0
    for (let i = 0; i < 100; i++) {
      const attacker = new Person()
      const defender = new Person()
      if (assault(attacker, defender)) count++
    }
    expect(count).toBeGreaterThan(25)
  })

  it('succeeds less than 75% of the time with average people', () => {
    let count = 0
    for (let i = 0; i < 100; i++) {
      const attacker = new Person()
      const defender = new Person()
      if (assault(attacker, defender)) count++
    }
    expect(count).toBeLessThan(75)
  })

  it('succeeds more often when the attacker has more deadly skills', () => {
    let count = 0
    for (let i = 0; i < 100; i++) {
      const attacker = new Person()
      const defender = new Person()
      attacker.skills.mastered.push('Deception','Running', 'Scouting', 'Archery')
      if (assault(attacker, defender)) count++
    }
    expect(count).toBeGreaterThan(75)
  })

  it('succeeds less often when the defender is properly skilled', () => {
    let count = 0
    for (let i = 0; i < 100; i++) {
      const attacker = new Person()
      const defender = new Person()
      defender.skills.mastered.push('Running', 'Scouting')
      if (assault(attacker, defender)) count++
    }
    expect(count).toBeLessThan(50)
  })
})
