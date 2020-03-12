/* global describe, it, expect */

import Person from './person'

import {
  checkTable,
  rollTableUntil,
  shuffle,
  pickRandom,
  inheritNormalDistribution,
  consensus
} from './utils'
import { allTrue } from '../../shared/utils'

describe('checkTable', () => {
  it('can check a random table', () => {
    const table = [
      { chance: 10, event: 'Test1' },
      { chance: 20, event: 'Test2' },
      { chance: 70, event: 'Test3' }
    ]
    const actual = [
      checkTable(table, 5),
      checkTable(table, 30),
      checkTable(table, 99)
    ]
    const expected = [ 'Test1', 'Test2', 'Test3' ]
    expect(actual).toEqual(expected)
  })
})

describe('rollTableUntil', () => {
  it('does not return an unacceptable result', () => {
    const table = [
      { chance: 10, event: 'Test1' },
      { chance: 20, event: 'Test2' },
      { chance: 70, event: 'Test3' }
    ]
    const actual = rollTableUntil(table, [ 'Test2', 'Test3' ])
    expect(actual).toEqual('Test1')
  })

  it('returns false if every option is deemed unacceptable', () => {
    const table = [
      { chance: 10, event: 'Test1' },
      { chance: 20, event: 'Test2' },
      { chance: 70, event: 'Test3' }
    ]
    const actual = rollTableUntil(table, [ 'Test1', 'Test2', 'Test3' ])
    expect(actual).toEqual(false)
  })
})

describe('shuffle', () => {
  it('can randomly reorder an array', () => {
    const actual = shuffle([ 1, 2, 3 ])
    const claims = [
      actual.length === 3,
      actual.includes(1),
      actual.includes(2),
      actual.includes(3)
    ]
    expect(allTrue(claims)).toEqual(true)
  })
})

describe('pickRandom', () => {
  it('selects a random item from an array', () => {
    const arr = [ 1, 2 ]
    const actual = pickRandom(arr)
    expect(arr.includes(actual)).toEqual(true)
  })
})

describe('inheritNormalDistribution', () => {
  it('selects a random value, using the average of the parents\' values as the mean', () => {
    let withinOne = 0
    for (let i = 0; i < 100; i++) {
      const child = inheritNormalDistribution(1, 1)
      if (child > 0 && child < 2) withinOne++
    }
    expect(withinOne).toBeGreaterThan(50)
  })
})

describe('consensus', () => {
  it('reaches a consensus', () => {
    const a = new Person()
    const b = new Person()
    expect(typeof consensus([ a ], [ b ])).toEqual('boolean')
  })

  it('returns true more than 25% of the time under normal circumstances', () => {
    let count = 0
    for (let i = 0; i < 100; i++) {
      const a = new Person()
      const b = new Person()
      if (consensus([ a ], [ b ])) count++
    }
    expect(count).toBeGreaterThan(25)
  })

  it('returns false less than 75% of the time under normal circumstances', () => {
    let count = 0
    for (let i = 0; i < 100; i++) {
      const a = new Person()
      const b = new Person()
      if (consensus([ a ], [ b ])) count++
    }
    expect(count).toBeLessThan(75)
  })

  it('favors those skilled in communication', () => {
    let count = 0
    for (let i = 0; i < 100; i++) {
      const a = new Person()
      a.skills.mastered.push('Communication')
      const b = new Person()
      if (consensus([ a ], [ b ])) count++
    }
    expect(count).toBeGreaterThan(45)
  })

  it('favors the side with more people', () => {
    let count = 0
    for (let i = 0; i < 100; i++) {
      const a = new Person()
      const b = new Person()
      const c = new Person()
      const d = new Person()
      if (consensus([ a, b, c ], [ d ])) count++
    }
    expect(count).toBeGreaterThan(45)
  })
})
