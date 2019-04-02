/* global it, expect */

import { throwError, saveContent } from './actions'
import Error from './reducers'

it('should return state by default', () => {
  const before = { msg: 'initial state' }
  const actual = Error(before, { type: 'undefined action type' })
  expect(actual).toEqual(before)
})

it('should log error', () => {
  const actual = Error(null, throwError(true))
  expect(actual).toEqual({ errors: [ true ] })
})

it('should log multiple errors in an array', () => {
  const actual = Error({ errors: [ true ] }, throwError([ true, false ]))
  expect(actual).toEqual({ errors: [ true, true, false ] })
})

it('should add to an array of errors', () => {
  const actual = Error({ errors: [ true ] }, throwError(false))
  expect(actual).toEqual({ errors: [ true, false ] })
})

it('should assign content', () => {
  const actual = Error(null, saveContent({}))
  expect(actual).toEqual({ content: {} })
})
