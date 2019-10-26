/* global describe, it, expect */

import { load } from './actions'
import Dashboard from './reducers'

describe('dashboard reducer', () => {
  it('should return state by default', () => {
    const before = { msg: 'initial state' }
    const actual = Dashboard(before, { type: 'undefined action type' })
    expect(actual).toEqual(before)
  })

  it('should load data', () => {
    const actual = Dashboard({}, load(true))
    expect(actual).toEqual(true)
  })
})
