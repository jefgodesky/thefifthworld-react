import * as types from './action-types'

export function throwError (err) {
  return {
    type: types.THROW_ERROR,
    payload: err
  }
}
