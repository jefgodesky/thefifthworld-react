import * as types from './action-types'

export function load (data) {
  return {
    type: types.DASHBOARD_LOAD,
    payload: data
  }
}
