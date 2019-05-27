import marked from 'marked'
import parseTemplates from './template'
import parseLinks from './links'
import {
  listChildren,
  listArtists,
  listOtherNames,
  listNamesKnown,
  doNotEmail,
  parseDownload,
  parseArt,
  parseTags
} from './special'

marked.setOptions({
  sanitize: true,
  sanitizer: markup => {
    const allowedHTML = 'pre code div ins del sup sub section blockquote dl dt dd'.split(' ')
    const inside = markup.replace(/<\/?(.*?)>/g, '$1').split(' ')
    return inside.length > 0 && allowedHTML.indexOf(inside[0]) > -1 ? markup : ''
  },
  smartLists: true,
  smartypants: true,
  xhtml: true
})

/**
 * This method parses wikitext into HTML.
 * @param wikitext {string} - A string of wikitext.
 * @param db {Pool} - A database connection. If none is provided, the method
 *   makes a request to the `/get-paths` endpoint. The `db` parameter is
 *   mostly for testing -- in production, this should generally use the
 *   endpoint, as this method is used on both the client and the server.
 * @param path {string} - The path of the page for which we're parsing this
 *   wikitext. This is used as the default reference point should the
 *   wikitext request a list of child pages. Defaults to null.
 * @returns {string} - The HTML string defined by the given wikitext.
 */

const parse = async (wikitext, db, path = null) => {
  if (wikitext) {
    // Removing stuff that shouldn't be rendered...
    wikitext = wikitext.replace(/{{Template}}(.*?){{\/Template}}/g, '') // Remove templates
    wikitext = wikitext.replace(/\[\[Type:(.*?)\]\]/g, '') // Remove [[Type:X]] tags

    // Render templates.
    wikitext = await parseTemplates(wikitext, db)

    // Render Markdown...
    wikitext = marked(wikitext.trim())
    wikitext = await listArtists(wikitext, db)
    wikitext = doNotEmail(wikitext)

    // More stuff that we need to check with the database on, after Markdown
    // has been rendered.
    wikitext = parseTags(wikitext)
    wikitext = await parseDownload(wikitext, db)
    wikitext = await parseArt(wikitext, db)
    wikitext = await listChildren(wikitext, path, db, true)
    wikitext = await listChildren(wikitext, path, db)
    wikitext = await listOtherNames(wikitext, path, db)
    wikitext = await listNamesKnown(wikitext, path, db)
    wikitext = await parseLinks(wikitext, db)

    return wikitext
  } else {
    return false
  }
}

export default parse