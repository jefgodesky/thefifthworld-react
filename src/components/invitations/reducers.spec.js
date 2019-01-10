/* global it, expect */

import { load } from './actions'
import Invitations from './reducers'

it('should return state by default', () => {
  const before = { msg: 'initial state' }
  const actual = Invitations(before, { type: 'undefined action type' })
  expect(actual).toEqual(before)
})

it('should load data', () => {
  const actual = Invitations({}, load(true))
  expect(actual).toEqual(true)
})
