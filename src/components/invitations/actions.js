import * as types from './action-types'

export function load (data) {
  return {
    type: types.INVITATIONS_LOAD,
    payload: data
  }
}
