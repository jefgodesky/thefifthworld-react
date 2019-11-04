/* global describe, it, expect */

import { check, checkUntil } from './check'

describe('check', () => {
  it('can check a random table', () => {
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

describe('checkUntil', () => {
  it('does not return an unacceptable result', () => {
    const table = [
      { chance: 10, event: 'Test1' },
      { chance: 20, event: 'Test2' },
      { chance: 70, event: 'Test3' }
    ]
    const actual = checkUntil(table, [ 'Test2', 'Test3' ])
    expect(actual).toEqual('Test1')
  })

  it('returns false if every option is deemed unacceptable', () => {
    const table = [
      { chance: 10, event: 'Test1' },
      { chance: 20, event: 'Test2' },
      { chance: 70, event: 'Test3' }
    ]
    const actual = checkUntil(table, [ 'Test1', 'Test2', 'Test3' ])
    expect(actual).toEqual(false)
  })
})
