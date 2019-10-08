import * as types from './action-types'

export function setStep (payload) {
  return {
    type: types.CC_SET_STEP,
    payload
  }
}

export function setCenter (lat, lon) {
  return {
    type: types.CC_SET_CENTER,
    payload: { lat, lon }
  }
}
