/* global describe, it, expect */

import shuffle from './shuffle'

describe('Shuffle', () => {
  it('can randomly reorder an array', async () => {
    const actual = shuffle([ 1, 2, 3, 4, 5 ])
    const claims = [
      actual.length === 5,
      actual.indexOf(1) > -1,
      actual.indexOf(2) > -1,
      actual.indexOf(3) > -1,
      actual.indexOf(4) > -1,
      actual.indexOf(5) > -1
    ]
    const expected = claims.reduce((acc, curr) => acc && curr)
    expect(expected).toEqual(true)
  })
})
