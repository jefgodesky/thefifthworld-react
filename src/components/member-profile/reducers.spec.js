/* global it, expect */

import { load } from './actions'
import MemberProfile from './reducers'

it('should return state by default', () => {
  const before = { msg: 'initial state' }
  const actual = MemberProfile(before, { type: 'undefined action type' })
  expect(actual).toEqual(before)
})

it('should load data', () => {
  const actual = MemberProfile({}, load(true))
  expect(actual).toEqual(true)
})
