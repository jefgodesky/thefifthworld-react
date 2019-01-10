/* global it, expect */

import { load } from './actions'
import Messages from './reducers'

it('should return state by default', () => {
  const before = { msg: 'initial state' }
  const actual = Messages(before, { type: 'undefined action type' })
  expect(actual).toEqual(before)
})

it('should load data', () => {
  const actual = Messages({}, load(true))
  expect(actual).toEqual(true)
})
