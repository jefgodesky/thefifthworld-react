import * as types from './action-types'

export function login (id) {
  return {
    type: types.LOGIN,
    payload: id
  }
}

export function logout () {
  return {
    type: types.LOGOUT
  }
}
