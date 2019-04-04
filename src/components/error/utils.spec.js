/* global describe, it, expect */

import { isKnownError, addError, resolveError, getErrorsFor } from './utils'

describe('isKnownError', () => {
  it('tells you when an error is in the array', () => {
    const error = {
      field: 'path',
      code: 'ER_DUP_ENTRY',
      value: '/dupe'
    }
    expect(isKnownError(error, [ error ])).toEqual(true)
  })

  it('tells you when an error is not in the array', () => {
    const e1 = {
      field: 'path',
      code: 'ER_DUP_ENTRY',
      value: '/dupe'
    }
    const e2 = {
      field: 'title',
      code: 'ER_SOMETHING_ELSE',
      value: 'nope'
    }
    expect(isKnownError(e2, [ e1 ])).toEqual(false)
  })
})

describe('addError', () => {
  it('adds an error to the array', () => {
    const error = {
      field: 'path',
      code: 'ER_DUP_ENTRY',
      value: '/dupe'
    }
    expect(addError(error, [])).toEqual([ error ])
  })
})

describe('resolveError', () => {
  it('removes an error from the array', () => {
    const error = {
      field: 'path',
      code: 'ER_DUP_ENTRY',
      value: '/dupe'
    }
    expect(resolveError(error, [ error ])).toEqual([])
  })

  it('removes an error from the array with only a field and a code', () => {
    const e1 = {
      field: 'path',
      code: 'ER_DUP_ENTRY',
      value: '/dupe'
    }
    const e2 = {
      field: 'path',
      code: 'ER_DIFF_CODE',
      value: '/dupe'
    }
    const r = {
      field: 'path',
      code: 'ER_DUP_ENTRY'
    }
    expect(resolveError(r, [ e1, e2 ])).toEqual([ e2 ])
  })

  it('removes an error from the array with only a field', () => {
    const e1 = {
      field: 'path',
      code: 'ER_DUP_ENTRY',
      value: '/dupe'
    }
    const e2 = {
      field: 'path',
      code: 'ER_DUP_ENTRY',
      value: '/another'
    }
    const r = {
      field: 'path'
    }
    expect(resolveError(r, [ e1, e2 ])).toEqual([])
  })
})

describe('getErrorsFor', () => {
  it('returns only those errors related to the specified field', () => {
    const e1 = {
      field: 'path',
      code: 'ER_DUP_ENTRY',
      value: '/dupe'
    }
    const e2 = {
      field: 'title',
      code: 'ER_SOMETHING_ELSE',
      value: 'nope'
    }
    const actual = getErrorsFor('path', [ e1, e2 ])
    expect(actual).toEqual([ e1 ])
  })
})
