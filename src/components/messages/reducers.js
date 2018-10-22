import * as types from './action-types'

/**
 * The Redux reducer function for state data related to the messages component,
 * which displays messages for logged-in members.
 * @param state {Object} - The previous state.
 * @param action {Object} - The action object.
 * @returns {Object} - The new state.
 * @constructor
 */

export default function Messages (state = [], action = {}) {
  switch (action.type) {
    case types.MESSAGES_LOAD:
      return action.payload
    default:
      return state
  }
}
