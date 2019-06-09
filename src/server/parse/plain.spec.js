/* global describe, it, expect */

import plainParse from './plain'

describe('plainParse', () => {
  it('strips out Markdown', async () => {
    expect.assertions(1)
    const actual = await plainParse('This has **bolded text**, *italicized text*, and text that is ***both*** **bolded** ***and*** *italicized* ***at the same time.***')
    const expected = 'This has bolded text, italicized text, and text that is both bolded and italicized at the same time.'
    expect(actual).toEqual(expected)
  })

  it('strips out links', async () => {
    expect.assertions(1)
    const actual = await plainParse('This has a [[simple link]] and a [[/path/to/something | more complex one]].')
    const expected = 'This has a simple link and a more complex one.'
    expect(actual).toEqual(expected)
  })

  it('strips out templates', async () => {
    expect.assertions(1)
    const actual = await plainParse('{{TemplateName param="here" otherParam="also here"}} This has a template.')
    const expected = 'This has a template.'
    expect(actual).toEqual(expected)
  })
})
