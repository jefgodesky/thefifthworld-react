import * as types from './action-types'

export function load (places) {
  return {
    type: types.EXPLORE_LOAD,
    payload: places
  }
}
