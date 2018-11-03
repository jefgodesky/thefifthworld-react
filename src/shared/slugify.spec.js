/* global describe, it, expect */

import slugify from './slugify'

describe('slugify', () => {
  it('slugifies a string', async () => {
    const actual = slugify('Csíkszentmihályi’s name includes some diacritics!')
    const expected = 'csikszentmihalyis-name-includes-some-diacritics'
    expect(actual).toEqual(expected)
  })
})
