import * as types from './action-types'

/**
 * The Redux reducer function for state data related to error handling.
 * @param state {Object} - The previous state.
 * @param action {Object} - The action object.
 * @returns {Object} - The new state.
 * @constructor
 */

export default function Error (state = null, action = {}) {
  switch (action.type) {
    case types.THROW_ERROR:
      return action.payload
    default:
      return state
  }
}
