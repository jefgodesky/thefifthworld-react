import * as types from './action-types'

export function login (user) {
  return {
    type: types.LOGIN,
    payload: user
  }
}

export function logout () {
  return {
    type: types.LOGOUT
  }
}
