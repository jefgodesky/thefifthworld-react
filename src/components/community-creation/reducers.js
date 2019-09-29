import * as types from './action-types'
import { clone } from '../../shared/utils'

const init = {
  step: 0
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
  const newState = clone(state || init)
  switch (action.type) {
    case types.CC_SET_STEP:
      newState.step = action.payload
      break
  }
  return newState
}
