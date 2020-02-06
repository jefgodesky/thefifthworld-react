/* global describe, it, expect */

import { allTrue } from '../../shared/utils'
import { shuffle, pickRandom } from './shuffle'

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
    expect(allTrue(claims)).toEqual(true)
  })
})

describe('pickRandom', () => {
  it('picks a random element from the array', () => {
    const arr = [ 1, 2, 3 ]
    const randomItem = pickRandom(arr)
    expect(arr.includes(randomItem)).toEqual(true)
  })
})
