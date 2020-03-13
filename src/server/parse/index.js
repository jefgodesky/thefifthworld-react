import marked from 'marked'
import sanitizeHtml from 'sanitize-html'
import parseTemplates from './template'
import parseLinks from './links'
import {
  escapeCodeBlockMarkdown,
  listChildren,
  listArtists,
  doNotEmail,
  parseDownload,
  parseArt,
  parseForm,
  parseTags,
  parseNovelListing,
  unwrapDivs
} from './special'

marked.setOptions({
  sanitizer: markup => {
    const allowedTags = 'br aside pre code div ins del sup sub section aside nav blockquote cite dl dt dd ul ol li span strong em'.split(' ')
    return sanitizeHtml(markup, {
      allowedTags
    })
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
 *   endpoint, as this method is used on both the client and the server. If
 *   this is `null`, templates and links will not be parsed.
 * @param path {string} - The path of the page for which we're parsing this
 *   wikitext. This is used as the default reference point should the
 *   wikitext request a list of child pages. (Default: null)
 * @returns {string} - The HTML string defined by the given wikitext.
 */

const parse = async (wikitext, db, path = null) => {
  if (wikitext) {
    // Removing stuff that shouldn't be rendered...
    wikitext = wikitext.replace(/{{Template}}(.*?){{\/Template}}/g, '') // Remove templates
    wikitext = wikitext.replace(/\[\[Type:(.*?)\]\]/g, '') // Remove [[Type:X]] tags
    wikitext = escapeCodeBlockMarkdown(wikitext)

    // Render templates.
    if (db) wikitext = await parseTemplates(wikitext, db)

    // Render Markdown...
    wikitext = marked(wikitext.trim())
    wikitext = parseForm(wikitext)
    if (db) wikitext = await listArtists(wikitext, db)
    wikitext = doNotEmail(wikitext)

    // Those escaped characters in code blocks just got double-escaped, so
    // let's fix that.
    const blocks = wikitext.match(/<pre><code>((.|\s)*?)<\/code><\/pre>/gm)
    if (blocks) {
      for (const block of blocks) {
        wikitext = wikitext.replace(block, block.replace(/&amp;/gm, '&'))
      }
    }

    // More stuff that we need to check with the database on, after Markdown
    // has been rendered.
    wikitext = parseTags(wikitext)
    if (db) {
      wikitext = await parseDownload(wikitext, db)
      wikitext = await parseArt(wikitext, db)
      wikitext = await parseNovelListing(wikitext, db)
      wikitext = await listChildren(wikitext, path, db, true)
      wikitext = await listChildren(wikitext, path, db)
      wikitext = await parseLinks(wikitext, db)
    }

    wikitext = unwrapDivs(wikitext)
    return wikitext
  } else {
    return false
  }
}

export default parse
