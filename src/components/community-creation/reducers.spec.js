/* global describe, it, expect */

import { setStep } from './actions'
import CommunityCreation from './reducers'

describe('CommunityCreation', () => {
  it('should return state by default', () => {
    const actual = CommunityCreation(undefined, { type: 'undefined action type' })
    expect(actual).toEqual({ step: 0 })
  })

  it('should set step', () => {
    const actual = CommunityCreation(undefined, setStep(1))
    expect(actual).toEqual({ step: 1 })
  })
})
