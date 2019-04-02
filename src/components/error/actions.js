import * as types from './action-types'

export function throwError (err) {
  return {
    type: types.THROW_ERROR,
    payload: err
  }
}

export function saveContent (content) {
  return {
    type: types.SAVE_CONTENT,
    payload: content
  }
}
