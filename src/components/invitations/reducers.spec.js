/* global describe, it, expect */

import { load } from './actions'
import Invitations from './reducers'

describe('invitations reducer', () => {
  it('should return state by default', () => {
    const before = { msg: 'initial state' }
    const actual = Invitations(before, { type: 'undefined action type' })
    expect(actual).toEqual(before)
  })

  it('should load data', () => {
    const actual = Invitations({}, load(true))
    expect(actual).toEqual(true)
  })
})
