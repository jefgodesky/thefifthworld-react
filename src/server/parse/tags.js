/**
 * Finds all of the tags defined in wikitext and parses them into an object.
 * @param str {string} - Wikitext.
 * @returns {Object} - An object in which each tag provides the name of a
 *   property. If the text includes only one instance of the tag, then the
 *   corresponding property is a string equal to that value. If the tag is used
 *   more than once in the wikitext, then its corresponding property is an
 *   array of strings, providing the value for each instance of the tag.
 */

const parseTags = str => {
  const tags = {}
  const bracketed = str ? str.match(/\[\[(.+?)\]\]/gm) : false
  if (bracketed) {
    const matches = bracketed.map(m => m.match(/\[\[(.+?):(.+?)\]\]/)).filter(m => m !== null)
    matches.forEach(m => {
      const tag = m[1]
      const val = m[2]
      const existing = tags[tag]
      if (existing === undefined) {
        tags[tag] = val
      } else if (typeof existing === 'string') {
        tags[tag] = [ existing, val ]
      } else if (Array.isArray(existing)) {
        tags[tag] = [ ...existing, val ]
      }
    })
  }
  return tags
}

/**
 * Returns the value of the first tag in the string, or all tags in the
 * string.
 * @param str {string} - A string of wikitext to search.
 * @param tag {string} - The tag to search for.
 * @param first {Boolean} - If `true`, returns the value of the first tag
 *   found. Otherwise, returns an array of the values of all tags found.
 * @returns {string|Array} - Either the value of the first tag found, or an
 *   array of the values of all tags found.
 */

const parseTag = (str, tag, first = false) => {
  const tags = parseTags(str)
  const t = tags && tags[tag] ? tags[tag] : null
  return first && Array.isArray(t) ? t[0] : t
}

/**
 * If the string includes a location tag, this returns an object with the
 * latitude and longitude specified by the last tag.
 * @param str {string} - A string of wikitext.
 * @returns {boolean|{lon: number, lat: number}} - `false` if the text does
 *   not include any location tags. If it does, it returns an object with two
 *   properties: `lat` (containing a float with the latitude specified by the
 *   last location tag in the wikitext) and `lon` (containing a float with
 *   the longitude specified by the last location tag in the wikitext).
 */

const parseLocation = str => {
  let coords = parseTag(str, 'Location', true)
  if (coords) {
    coords = coords.split(',')
    return coords.length === 2
      ? {
        lat: parseFloat(coords[0].trim()),
        lon: parseFloat(coords[1].trim())
      }
      : false
  } else {
    return false
  }
}

/**
 * Returns the appropriate type for a page, given the wikitext.
 * @param str {string} - Wikitext.
 * @returns {*} - If the wikitext includes a location, tag, the type is 'Place'
 *   regardless of any type tag. Otherwise, the first type tag sets the value.
 *   If the wikitext does not include any location or type tags, it returns
 *   `null`.
 */

const parseType = str => {
  const type = parseTag(str, 'Type', true)
  const coords = parseLocation(str)
  return coords ? 'Place' : type || null
}

export {
  parseTags,
  parseTag,
  parseLocation,
  parseType
}
