/* global it, expect */

import { load } from './actions'
import Explore from './reducers'

it('should return state by default', () => {
  const before = { msg: 'initial state' }
  const actual = Explore(before, { type: 'undefined action type' })
  expect(actual).toEqual(before)
})

it('should load data', () => {
  const actual = Explore({}, load(true))
  expect(actual).toEqual(true)
})
