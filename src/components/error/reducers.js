import * as types from './action-types'

/**
 * The Redux reducer function for state data related to error handling.
 * @param state {Object} - The previous state.
 * @param action {Object} - The action object.
 * @returns {Object} - The new state.
 * @constructor
 */

export default function Error (state = { errors: [] }, action = {}) {
  switch (action.type) {
    case types.THROW_ERROR:
      if (state && state.errors && Array.isArray(state.errors) && Array.isArray(action.payload)) {
        return Object.assign({}, state, { errors: [ ...state.errors, ...action.payload ] })
      } else if (state && state.errors && Array.isArray(state.errors)) {
        return Object.assign({}, state, { errors: [ ...state.errors, action.payload ] })
      } else {
        return { errors: [ action.payload ] }
      }
    case types.SAVE_CONTENT:
      return Object.assign({}, state, { content: action.payload })
    default:
      return state
  }
}
