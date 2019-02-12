/* global it, expect */

import { throwError } from './actions'
import Error from './reducers'

it('should return state by default', () => {
  const before = { msg: 'initial state' }
  const actual = Error(before, { type: 'undefined action type' })
  expect(actual).toEqual(before)
})

it('should log error', () => {
  const actual = Error({}, throwError(true))
  expect(actual).toEqual(true)
})
