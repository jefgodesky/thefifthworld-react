import * as types from './action-types'

/**
 * The Redux reducer function for state data related to pages.
 * @param state {Object} - The previous state.
 * @param action {Object} - The action object.
 * @returns {Object} - The new state.
 * @constructor
 */

export default function Page (state = {}, action = {}) {
  switch (action.type) {
    case types.PAGE_LOAD:
      // Called when the page is loaded from the database, which should really
      // only happen on the server.
      return action.payload
    default:
      return state
  }
}
