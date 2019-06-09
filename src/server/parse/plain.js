import parse from './index'

/**
 * Returns the plain text of the parsed Markdown text, with all Markdown annd
 * other tags removed.
 * @param markdown {string} - Markdown text to parse.
 * @returns {Promise<*>} - A Promise that resolves with the plain text of the
 *   Markdown string provided.
 */

const plainParse = async (markdown) => {
  const parsed = await parse(markdown)
  return parsed.replace(/<[^>]*>?/gm, '')
}

export default plainParse
