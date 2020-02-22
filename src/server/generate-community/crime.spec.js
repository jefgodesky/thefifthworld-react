/* global describe, it, expect */

import Person from './person'

import { considerViolence } from './crime'

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
