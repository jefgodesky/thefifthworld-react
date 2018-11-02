import * as types from './action-types'

export function load (page) {
  return {
    type: types.PAGE_LOAD,
    payload: page
  }
}
