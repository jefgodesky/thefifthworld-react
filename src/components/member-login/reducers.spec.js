/* global describe, it, expect */

import { login, logout } from './actions'
import MemberLogin from './reducers'

describe('member login reducer', () => {
  it('should return state by default', () => {
    const before = { msg: 'initial state' }
    const actual = MemberLogin(before, { type: 'undefined action type' })
    expect(actual).toEqual(before)
  })

  it('should log in', () => {
    const actual = MemberLogin({}, login(true))
    expect(actual).toEqual(true)
  })

  it('should log out', () => {
    const s1 = MemberLogin({}, login(true))
    const actual = MemberLogin(s1, logout())
    expect(actual).toEqual(null)
  })
})
