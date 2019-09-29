import * as types from './action-types'

export function setStep (payload) {
  return {
    type: types.CC_SET_STEP,
    payload
  }
}
