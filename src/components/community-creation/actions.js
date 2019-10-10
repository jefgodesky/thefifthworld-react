import * as types from './action-types'

export function load (payload) {
  return {
    type: types.CC_LOAD,
    payload
  }
}

export function setCenter (lat, lon) {
  return {
    type: types.CC_SET_CENTER,
    payload: { lat, lon }
  }
}

export function setSpecialties (payload) {
  return {
    type: types.CC_SET_SPECIALTIES,
    payload
  }
}
