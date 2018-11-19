import * as types from './action-types'

/**
 * The Redux reducer function for state data related to invitations.
 * @param state {Object} - The previous state.
 * @param action {Object} - The action object.
 * @returns {Object} - The new state.
 * @constructor
 */

export default function Invitations (state = null, action = {}) {
  switch (action.type) {
    case types.INVITATIONS_LOAD:
      return action.payload
    default:
      return state
  }
}
