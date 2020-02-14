/* global describe, it, expect */

import {
  checkExists,
  isPopulatedArray,
  allTrue,
  avg,
  get,
  formatDate,
  dedupe,
  getFileSizeStr,
  clone,
  alphabetize,
  between,
  randomValFromNormalDistribution,
  probabilityInNormalDistribution
} from './utils'

describe('checkExists', () => {
  it('can tell if a chain of properties exist', () => {
    const obj = { prop: true }
    const actual = [ checkExists(obj, 'prop'), checkExists(obj, 'prop.nope') ]
    const expected = [ true, false ]
    expect(actual).toEqual(expected)
  })
})

describe('isPopulatedArray', () => {
  it('returns true if its param is an array with one or more items', () => {
    expect(isPopulatedArray([ 0 ])).toEqual(true)
  })

  it('returns false if its param is an array with zero items', () => {
    expect(isPopulatedArray([])).toEqual(false)
  })

  it('returns false if its param is not an array', () => {
    expect(isPopulatedArray('hello')).toEqual(false)
  })

  it('returns false if its param is null', () => {
    expect(isPopulatedArray(null)).toEqual(false)
  })

  it('returns false if its param is undefined', () => {
    expect(isPopulatedArray(undefined)).toEqual(false)
  })

  it('returns false if its param is false', () => {
    expect(isPopulatedArray(false)).toEqual(false)
  })
})

describe('allTrue', () => {
  it('returns false if not given an array', () => {
    expect(allTrue(true)).toEqual(false)
  })

  it('returns true if all values in array are true', () => {
    expect(allTrue([ true, true ])).toEqual(true)
  })

  it('returns true if all values in array are truthy', () => {
    expect(allTrue([ true, 1, 'yes' ])).toEqual(true)
  })

  it('returns false if any value in array is false', () => {
    expect(allTrue([ true, false, true ])).toEqual(false)
  })

  it('returns false if any value in array is falsy', () => {
    expect(allTrue([ true, 0, true ])).toEqual(false)
  })
})

describe('avg', () => {
  it('returns the average of an array of numbers', () => {
    expect(avg([ 1, 2, 3 ])).toEqual(2)
  })

  it('ignores non-numbers', () => {
    expect(avg([ 1, 2, 3, '4' ])).toEqual(2)
  })

  it('returns 0 if there are no non-numbers in the array', () => {
    expect(avg([ true, 'two', { val: 3 } ])).toEqual(0)
  })
})

describe('get', () => {
  it('can return a value from a chain of properties', () => {
    const obj = { outer: { inner: 42 } }
    expect(get(obj, 'outer.inner')).toEqual(42)
  })

  it('returns undefined if given a path the object does not contain', () => {
    const obj = { outer: { inner: 42 } }
    expect(get(obj, 'outer.nope')).toEqual(undefined)
  })

  it('returns undefined if not given an object', () => {
    expect(get(42, 'prop')).toEqual(undefined)
  })
})

describe('formatDate', () => {
  it('can format a date', () => {
    const date = new Date('November 11, 1918 11:11:11')
    const actual = formatDate(date)
    const expected = '11&nbsp;Nov&nbsp;1918 11:11&nbsp;AM'
    expect(actual).toEqual(expected)
  })

  it('can handle noon', () => {
    const date = new Date('July 4, 1776 12:30:00')
    const actual = formatDate(date)
    const expected = '4&nbsp;Jul&nbsp;1776 12:30&nbsp;PM'
    expect(actual).toEqual(expected)
  })

  it('can handle midnight', () => {
    const date = new Date('July 14, 1789 00:15:00')
    const actual = formatDate(date)
    const expected = '14&nbsp;Jul&nbsp;1789 12:15&nbsp;AM'
    expect(actual).toEqual(expected)
  })
})

describe('dedupe', () => {
  it('can deduplicate an array', () => {
    const orig = [ 1, 1, 2, 3 ]
    const actual = dedupe(orig)
    expect(actual).toEqual([ 1, 2, 3 ])
  })

  it('does not mutate the array', () => {
    const orig = [ 1, 1, 2, 3 ]
    const deduped = dedupe(orig)
    const expected = {
      orig: [ 1, 1, 2, 3 ],
      deduped: [ 1, 2, 3 ]
    }
    const actual = { orig, deduped }
    expect(actual).toEqual(expected)
  })

  it('can dedupe objects', () => {
    const arr = [ { test: true }, { test: true } ]
    expect(dedupe(arr)).toEqual([ { test: true } ])
  })
})

describe('getFileSizeStr', () => {
  it('describes a file size', () => {
    const sizes = [ 900, 900000, 900000000, 1100000000 ]
    const actual = sizes.map(size => getFileSizeStr(size))
    const expected = [ '900 B', '900 kB', '900 MB', '1.1 GB' ]
    expect(actual).toEqual(expected)
  })
})

describe('clone', () => {
  it('can deep clone objects', () => {
    const obj = {
      param: {
        val: {
          nested: true
        }
      }
    }
    const c = clone(obj)
    expect(c).toEqual(obj)
  })

  it('can deep clone an array', () => {
    const arr = [
      { param: { val: { nested: true } } },
      { param: { otherVal: [ 1, 2, 3 ] } },
      'Hello',
      [ 4, 5, 6 ]
    ]
    const c = clone(arr)
    expect(c).toEqual(arr)
  })
})

describe('alphabetize', () => {
  it('can alphabetize an array of strings', () => {
    const actual = alphabetize([ 'banana', 'apple', 'carrot' ])
    expect(actual).toEqual([ 'apple', 'banana', 'carrot' ])
  })
})

describe('between', () => {
  it('returns the value if it is between the min and the max', () => {
    const actual = between(50, 1, 100)
    expect(actual).toEqual(50)
  })

  it('returns the min if the value is less than that', () => {
    const actual = between(0, 1, 100)
    expect(actual).toEqual(1)
  })

  it('returns the max if the value is greater than that', () => {
    const actual = between(110, 1, 100)
    expect(actual).toEqual(100)
  })
})

describe('randomValFromNormalDistribution', () => {
  it('is within one standard deviation about 68% of the time', () => {
    let count = 0
    for (let i = 0; i < 100; i++) {
      const val = randomValFromNormalDistribution()
      if (val > -1 && val < 1) count++
    }
    const notTooFew = count > 48
    const notTooMany = count < 88
    expect(notTooFew && notTooMany).toEqual(true)
  })

  it('is within two standard deviations about 95% of the time', () => {
    let count = 0
    for (let i = 0; i < 100; i++) {
      const val = randomValFromNormalDistribution()
      if (val > -2 && val < 2) count++
    }
    expect(count > 75).toEqual(true)
  })
})

describe('probabilityInNormalDistribution', () => {
  it('returns 50 when given the mean', () => {
    expect(probabilityInNormalDistribution(0)).toEqual(50)
  })
})
