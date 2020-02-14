/* global describe, it, expect */

import {
  checkTable,
  rollTableUntil,
  shuffle
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
  it('can randomly reorder an array', async () => {
    const actual = shuffle([ 1, 2, 3, 4, 5 ])
    const claims = [
      actual.length === 5,
      actual.includes(1),
      actual.includes(2),
      actual.includes(3),
      actual.includes(4),
      actual.includes(5)
    ]
    expect(allTrue(claims)).toEqual(true)
  })
})
