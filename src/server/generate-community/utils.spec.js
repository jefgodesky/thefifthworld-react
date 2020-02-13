/* global describe, it, expect */

import {
  rollTable
} from './utils'

describe('rollTable', () => {
  it('can check a random table', () => {
    const table = [
      { chance: 10, event: 'Test1' },
      { chance: 20, event: 'Test2' },
      { chance: 70, event: 'Test3' }
    ]
    const actual = [
      rollTable(table, 5),
      rollTable(table, 30),
      rollTable(table, 99)
    ]
    const expected = [ 'Test1', 'Test2', 'Test3' ]
    expect(actual).toEqual(expected)
  })
})
