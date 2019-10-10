import * as types from './action-types'
import { clone } from '../../shared/utils'
import { convertCoords } from '../../shared/utils.geo'

const init = {
  step: 0,
  territory: {},
  traditions: {},
  chronicle: [],
  people: []
}

/**
 * The Redux reducer function for state data related to the community creation
 * wizard.
 * @param state {Object} - The previous state.
 * @param action {Object} - The action object.
 * @returns {Object} - The new state.
 * @constructor
 */

export default function CommunityCreation (state = init, action = {}) {
  let newState = clone(state || init)
  const { type, payload } = action
  let coords
  switch (type) {
    case types.CC_LOAD:
      newState = payload
      break
    case types.CC_SET_STEP:
      newState.step = payload
      break
    case types.CC_SET_CENTER:
      coords = convertCoords(payload)
      newState.territory.center = [ coords.lat, coords.lon ]
      break
    case types.CC_SET_SPECIALTIES:
      newState.traditions.specialties = payload
      break
  }
  return newState
}
