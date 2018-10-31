/* global describe, it, expect */

import * as utils from './utils'

describe('updateVals', () => {
  it('can generate a string for an update statement', () => {
    const actual = utils.updateVals([
      { name: 'stringField', type: 'string' },
      { name: 'numField', type: 'number' }
    ], {
      stringField: 'string value',
      numField: 42
    })
    const expected = `stringField='string value', numField=42`
    expect(actual).toEqual(expected)
  })
})
