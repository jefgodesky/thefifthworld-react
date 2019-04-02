/* global describe, it, expect */

import { isSameError, isKnownError, addError, resolveError, getErrorsFor } from './utils'

describe('isSameError', () => {
  it('tells you when two errors are the same', () => {
    const e1 = {
      field: 'path',
      code: 'ER_DUP_ENTRY',
      value: '/dupe'
    }
    const e2 = {
      field: 'path',
      code: 'ER_DUP_ENTRY',
      value: '/dupe'
    }
    expect(isSameError(e1, e2)).toEqual(true)
  })

  it('tells you when two errors are not the same', () => {
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
    expect(isSameError(e1, e2)).toEqual(false)
  })
})

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
