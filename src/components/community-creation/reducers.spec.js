/* global describe, it, expect */

import { load, setCenter, setSpecialties } from './actions'
import CommunityCreation from './reducers'

describe('CommunityCreation', () => {
  it('should return state by default', () => {
    const actual = CommunityCreation(undefined, { type: 'undefined action type' })
    expect(actual).toEqual({
      territory: {},
      traditions: {},
      chronicle: [],
      people: []
    })
  })

  it('should load state', () => {
    const actual = CommunityCreation(undefined, load(true))
    expect(actual).toEqual(true)
  })

  it('should set center', () => {
    const actual = CommunityCreation(undefined, setCenter(40.441810, -80.012770))
    expect(actual).toEqual({
      territory: {
        center: [ 40.441810, -80.012770 ]
      },
      traditions: {},
      chronicle: [],
      people: []
    })
  })

  it('should set specialties', () => {
    const actual = CommunityCreation(undefined, setSpecialties([ 'Apples', 'Bananas', 'Carrots' ]))
    expect(actual).toEqual({
      territory: {},
      traditions: {
        specialties: [ 'Apples', 'Bananas', 'Carrots' ]
      },
      chronicle: [],
      people: []
    })
  })
})
