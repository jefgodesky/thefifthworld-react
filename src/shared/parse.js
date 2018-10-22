/**
 * This method parses wikitext into HTML.
 * @param wikitext {string} - A string of wikitext.
 * @returns {string} - The HTML string defined by the given wikitext.
 */

const parse = wikitext => {
  let text = wikitext
  text = text.replace(/'''''(.*?)'''''/g, '<strong><em>$1</em></strong>')
  text = text.replace(/'''(.*?)'''/g, '<strong>$1</strong>')
  text = text.replace(/''(.*?)''/g, '<em>$1</em>')
  text = text.replace(/\[(.*?) (.*?)\]/g, '<a href="$1">$2</a>')
  return text
}

export default parse
