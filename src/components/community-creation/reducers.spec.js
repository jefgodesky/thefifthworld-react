/* global describe, it, expect */

import {setCenter, setStep} from './actions'
import CommunityCreation from './reducers'

describe('CommunityCreation', () => {
  it('should return state by default', () => {
    const actual = CommunityCreation(undefined, { type: 'undefined action type' })
    expect(actual).toEqual({
      step: 0,
      territory: {},
      chronicle: [],
      people: []
    })
  })

  it('should set step', () => {
    const actual = CommunityCreation(undefined, setStep(1))
    expect(actual).toEqual({
      step: 1,
      territory: {},
      chronicle: [],
      people: []
    })
  })

  it('should set center', () => {
    const actual = CommunityCreation(undefined, setCenter(40.441810, -80.012770))
    expect(actual).toEqual({
      step: 0,
      territory: {
        center: [ 40.441810, -80.012770 ]
      },
      chronicle: [],
      people: []
    })
  })
})
