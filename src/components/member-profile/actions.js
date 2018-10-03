import * as types from './action-types'

export function load (member) {
  return {
    type: types.MEMBER_PROFILE_LOAD,
    payload: member
  }
}
