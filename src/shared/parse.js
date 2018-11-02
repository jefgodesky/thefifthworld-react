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

  const paragraphs = text.match(/(.+?)(\n|$)+/g).map(p => `<p>${p.trim()}</p>`).filter(p => p !== '<p></p>')
  return paragraphs.length > 1 ? paragraphs.join('\n') : text
}

export default parse
