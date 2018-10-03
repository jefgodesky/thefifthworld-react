import * as types from './action-types'

const init = { loggedIn: null }

/**
 * The Redux reducer function for state data related to the member login.
 * @param state {Object} - The previous state.
 * @param action {Object} - The action object.
 * @returns {Object} - The new state.
 * @constructor
 */

export default function MemberLogin (state = init, action = {}) {
  switch (action.type) {
    case types.LOGIN:
      // User is being logged in
      return { loggedIn: action.payload }
    case types.LOGOUT:
      // User is being logged out
      return { loggedIn: null }
    default:
      return state
  }
}
