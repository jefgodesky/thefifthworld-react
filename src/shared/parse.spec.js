/* global describe, it, expect */

import parse from './parse'

describe('Wikitext parser', () => {
  it('handles bolding', () => {
    const wikitext = `'''This''' has a few '''bolded''' words.`
    const actual = parse(wikitext)
    const expected = '<strong>This</strong> has a few <strong>bolded</strong> words.'
    expect(actual).toEqual(expected)
  })

  it('handles italics', () => {
    const wikitext = `''This'' has a few ''italicized'' words.`
    const actual = parse(wikitext)
    const expected = '<em>This</em> has a few <em>italicized</em> words.'
    expect(actual).toEqual(expected)
  })

  it('handles bolding and italics', () => {
    const wikitext = `''This'' has a few ''words'' that are both '''bolded''' '''''and''''' ''italicized''.`
    const actual = parse(wikitext)
    const expected = '<em>This</em> has a few <em>words</em> that are both <strong>bolded</strong> <strong><em>and</em></strong> <em>italicized</em>.'
    expect(actual).toEqual(expected)
  })

  it('handles external links', () => {
    const wikitext = `This contains a [https://thefifthworld.com link].`
    const actual = parse(wikitext)
    const expected = 'This contains a <a href="https://thefifthworld.com">link</a>.'
    expect(actual).toEqual(expected)
  })
})
