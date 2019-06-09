/* global describe, it, expect */

import plainParse from './plain'

describe('plainParse', () => {
  it('strips out Markdown tags', async () => {
    expect.assertions(1)
    const actual = await plainParse('This has **bolded text**, *italicized text*, and text that is ***both*** **bolded** ***and*** *italicized* ***at the same time.***')
    const expected = 'This has bolded text, italicized text, and text that is both bolded and italicized at the same time.'
    expect(actual).toEqual(expected)
  })
})
