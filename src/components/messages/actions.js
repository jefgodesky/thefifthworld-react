import * as types from './action-types'

export function load (messages) {
  return {
    type: types.MESSAGES_LOAD,
    payload: messages
  }
}
