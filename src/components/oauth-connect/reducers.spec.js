/* global describe, it, expect */

import { load } from './actions'
import OAuth2Connect from './reducers'

describe('oauth connect reducer', () => {
  it('should return state by default', () => {
    const before = { msg: 'initial state' }
    const actual = OAuth2Connect(before, { type: 'undefined action type' })
    expect(actual).toEqual(before)
  })

  it('should load data', () => {
    const actual = OAuth2Connect({}, load(true))
    expect(actual).toEqual(true)
  })
})
