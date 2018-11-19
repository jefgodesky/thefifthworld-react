import * as types from './action-types'

export function load (data) {
  return {
    type: types.OAUTH_CONNECT_LOAD,
    payload: data
  }
}
