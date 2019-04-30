import Page from '../../shared/models/page'
import slugify from '../../shared/slugify'

/**
 * Transforms the result of a regex match for links in a wikitext snippet into
 * an array of objects with appropriate link data.
 * @param links {Array} - The result of a regex match for links in a wikitext
 *   snippet.
 * @returns {*} - An array of link objects.
 */

const getLinkObjects = links => {
  return links.map(link => {
    const text = link.substr(2, link.length - 4).trim()
    const parts = text.split('|')
    const usesPath = parts[0][0] === '/'
    const title = usesPath ? parts[0].substr(0, parts[0].indexOf(' ')) : parts[0]
    const display = usesPath
      ? parts[0].substr(parts[0].indexOf(' ') + 1)
      : parts.length > 1 ? parts[1] : parts[0]

    return {
      orig: link,
      title,
      display
    }
  })
}

/**
 * Given an array of link objects derived from wikitext, this method queries
 * the databbase for the matching page and adds the information needed to link
 * to those pages.
 * @param links {Array} - An array of link objects.
 * @param db {Pool} - A database connection.
 * @returns {Promise<*>} - A promise that resolves with the same array of link
 *   objects, but each object should now have a `path` property equal to the
 *   path that the link should go to.
 */

const mergeDB = async (links, db) => {
  const data = await Page.getPaths(links.map(link => link.title), db)
  data.forEach(link => {
    links.forEach(match => {
      // Match on title
      if (!match.path && link.title.toLowerCase() === match.title.toLowerCase()) {
        match.path = link.path
      }

      // Match on path
      if (link.path === match.title) {
        match.path = link.path
      }
    })
  })
  return links
}

/**
 * Iterates over an array of link objects, and for each that has a null or
 * falsey path sets the path to the URL to create a new page, and adds the
 * `isNew` flag to the object.
 * @param links {Array} - An array of link objects.
 * @returns {Array} - The given array of link objects, but with each object
 *   that's missing a path given a path to create a new page and with a
 *   boolean flag indicating that it will do so.
 */

const markNewLinks = links => {
  return links.map(link => {
    if (!link.path) {
      return Object.assign({}, link, {
        path: `/${slugify(link.title)}?create`,
        isNew: true
      })
    } else {
      return link
    }
  })
}

/**
 * Parses wikitext for links.
 * @param wikitext {string} - Wikitext to parse.
 * @param db {Pool} - A database connection.
 * @returns {Promise<*>} - A promise that resolves with the given wikitext,
 *   where all links have been replaced with HTML links.
 */

const parseLinks = async (wikitext, db) => {
  let links = wikitext.match(/\[\[(.*?)\]\]/g)

  if (links) {
    links = getLinkObjects(links)
    links = await mergeDB(links, db)
    links = markNewLinks(links)

    links.forEach(link => {
      const a = link.isNew
        ? `<a href="${link.path}" class="new">${link.display}</a>`
        : `<a href="${link.path}">${link.display}</a>`
      wikitext = wikitext.replace(link.orig, a)
    })
  }

  return wikitext
}

export default parseLinks
