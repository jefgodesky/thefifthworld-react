import * as types from './action-types'

/**
 * The Redux reducer function for state data related to the "Explore" page.
 * @param state {Object} - The previous state.
 * @param action {Object} - The action object.
 * @returns {Object} - The new state.
 * @constructor
 */

export default function Explore (state = {}, action = {}) {
  switch (action.type) {
    case types.EXPLORE_LOAD:
      return action.payload
    default:
      return state
  }
}
