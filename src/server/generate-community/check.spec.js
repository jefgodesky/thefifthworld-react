/* global describe, it, expect */

import { check } from './check'

describe('Check', () => {
  it('can check a random table', async () => {
    const table = [
      { chance: 10, event: 'Test1' },
      { chance: 20, event: 'Test2' },
      { chance: 70, event: 'Test3' }
    ]
    const actual = [
      check(table, 5),
      check(table, 30),
      check(table, 99)
    ]
    const expected = [ 'Test1', 'Test2', 'Test3' ]
    expect(actual).toEqual(expected)
  })
})
