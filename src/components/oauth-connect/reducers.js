import * as types from './action-types'

/**
 * The Redux reducer function for state data related to the OAuth
 * authentications that a membe has set up.
 * @param state {Object} - The previous state.
 * @param action {Object} - The action object.
 * @returns {Object} - The new state.
 * @constructor
 */

export default function OAuth2Connect (state = null, action = {}) {
  switch (action.type) {
    case types.OAUTH_CONNECT_LOAD:
      return action.payload
    default:
      return state
  }
}
