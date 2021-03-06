import * as types from './action-types'

/**
 * The Redux reducer function for state data related to the member login.
 * @param state {Object} - The previous state.
 * @param action {Object} - The action object.
 * @returns {Object} - The new state.
 * @constructor
 */

export default function MemberLogin (state = null, action = {}) {
  switch (action.type) {
    case types.LOGIN:
      // User is being logged in
      return action.payload
    case types.LOGOUT:
      // User is being logged out
      return null
    default:
      return state
  }
}
