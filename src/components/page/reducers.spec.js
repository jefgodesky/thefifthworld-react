/* global it, expect */

import { load } from './actions'
import Page from './reducers'

it('should return state by default', () => {
  const before = { msg: 'initial state' }
  const actual = Page(before, { type: 'undefined action type' })
  expect(actual).toEqual(before)
})

it('should load data', () => {
  const actual = Page({}, load(true))
  expect(actual).toEqual(true)
})
