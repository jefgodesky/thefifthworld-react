/* global describe, it, expect */

import {
  checkTable
} from './utils'

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
