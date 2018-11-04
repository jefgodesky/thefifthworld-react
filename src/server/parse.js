import Page from '../shared/models/page'
import slugify from '../shared/slugify'

/**
 * This method parses wikitext into HTML.
 * @param wikitext {string} - A string of wikitext.
 * @param db {Pool} - A database connection. If none is provided, the method
 *   makes a request to the `/get-paths` endpoint. The `db` parameter is
 *   mostly for testing -- in production, this should generally use the
 *   endpoint, as this method is used on both the client and the server.
 * @returns {string} - The HTML string defined by the given wikitext.
 */

const parse = async (wikitext, db) => {
  if (wikitext) {
    const linkMatches = wikitext.match(/\[\[(.*?)\]\]/g)
    if (linkMatches) {
      const links = []

      // Parse links into objects
      linkMatches.forEach(link => {
        const text = link.substr(2, link.length - 4).trim()
        const parts = text.split('|')
        links.push({
          orig: link,
          title: parts[0],
          display: parts.length > 1 ? parts[1] : parts[0]
        })
      })

      // Get paths from database and merge them into objects
      const linkData = await Page.getPathsByTitle(links.map(link => link.title), db)
      linkData.forEach(link => {
        links.forEach(match => {
          if (link.title === match.title) {
            match.path = link.path
          }
        })
      })

      // Loop over once more to find links without a path yet, and set them up
      // with a link to create a new page.
      links.map(link => {
        if (!link.path) {
          link.path = `/${slugify(link.title)}?create`
          link.isNew = true
        }
      })

      // And finally we have everything we need to replace the links in the
      // wikitext with HTML.
      links.forEach(link => {
        const a = link.isNew
          ? `<a href="${link.path}" class="new">${link.display}</a>`
          : `<a href="${link.path}">${link.display}</a>`
        wikitext = wikitext.replace(link.orig, a)
      })
    }

    // Bolding, italics, and external links
    wikitext = wikitext.replace(/'''''(.*?)'''''/g, '<strong><em>$1</em></strong>')
    wikitext = wikitext.replace(/'''(.*?)'''/g, '<strong>$1</strong>')
    wikitext = wikitext.replace(/''(.*?)''/g, '<em>$1</em>')
    wikitext = wikitext.replace(/\[(.*?) (.*?)\]/g, '<a href="$1">$2</a>')

    const paragraphs = wikitext.match(/(.+?)(\r|\n|$)+/g).map(p => `<p>${p.trim()}</p>`).filter(p => p !== '<p></p>')
    return paragraphs.length > 1 ? paragraphs.join('\n') : `<p>${wikitext}</p>`
  } else {
    return false
  }
}

export default parse
