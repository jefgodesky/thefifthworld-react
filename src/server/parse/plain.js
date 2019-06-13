import parse from './index'

/**
 * Parses links, but rather than actually creating links, just replaces them
 * with their plain text values.
 * @param txt {string} - Text to parse.
 * @returns {*} - Parsed plain text.
 */

const plainParseLinks = txt => {
  const links = txt.match(/\[\[(.*?)\]\]/g)
  if (links) {
    links.forEach(link => {
      const full = link.substr(2, link.length - 4).trim()
      const parts = full.split('|')
      const text = parts.length > 1 ? parts[1] : full
      txt = txt.replace(link, text)
    })
  }
  return txt
}

/**
 * Returns the plain text of the parsed Markdown text, with all Markdown annd
 * other tags removed.
 * @param markdown {string} - Markdown text to parse.
 * @returns {Promise<*>} - A Promise that resolves with the plain text of the
 *   Markdown string provided.
 */

const plainParse = async (markdown) => {
  let plain = await parse(markdown) || ''
  plain = plain.replace(/<[^>]*>?/gm, '')
  plain = plainParseLinks(plain)
  plain = plain.replace(/{{(.*?)}}/g, '')
  plain = plain.replace(/\s+/g, ' ')
  return plain.trim()
}

export default plainParse
