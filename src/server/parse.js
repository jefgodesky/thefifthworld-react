import marked from 'marked'
import Page from '../shared/models/page'
import slugify from '../shared/slugify'
import { getFileSizeStr } from '../shared/utils'
import config from '../../config'

marked.setOptions({
  sanitize: true,
  sanitizer: markup => {
    const allowedHTML = 'strong em ul ol li a pre code img div ins del sup sub section table thead tbody tfoot blockquote dl dt dd tr td th span strike'.split(' ')
    const inside = markup.replace(/<\/?(.*?)>/g, '$1').split(' ')
    return inside.length > 0 && allowedHTML.indexOf(inside[0]) > -1 ? markup : ''
  },
  smartLists: true,
  smartypants: true,
  xhtml: true
})

/**
 * Fetches templates from the database and returns an array of objects.
 * @param matches {Array} - The results of a regex match searching for template
 *   calls in a piece of wikitext.
 * @param db {Pool} - A database connection.
 * @returns {Promise<Array>} - A promise that resolves with an array of objects
 *   corresponding to the template calls given. Each object will include a
 *   `match` property specifying the string that was matched (e.g.,
 *   `{{Example Template}}`) and a `wikitext` property, providing the wikitext
 *   of that template (with all [[Type:]] tags removed).
 */

const addTemplates = async (matches, db) => {
  const templates = []
  for (const match of matches) {
    const tpl = match.replace(/\n/g, '')
    const name = tpl.substr(2, tpl.length - 4).replace(/\s(.*?)="(.*?)"/g, '')

    // What are the parameters?
    const paramStrings = tpl.match(/\s(.*?)="(.*?)"/g)
    const params = {}
    if (paramStrings) {
      paramStrings.forEach(str => {
        const pair = str.trim().split('=')
        if (Array.isArray(pair) && pair.length > 0) {
          params[pair[0].trim()] = pair[1].substr(1, pair[1].length - 2).trim()
        }
      })
    }

    const res = await db.run(`SELECT c.json AS json FROM changes c, pages p WHERE p.id=c.page AND p.type='Template' AND p.title='${name}' ORDER BY p.depth ASC, c.timestamp DESC;`)
    if (res.length > 0) {
      const full = JSON.parse(res[0].json).body.replace(/\[\[Type:(.*?)\]\]/g, '').trim()
      const tagged = full.match(/{{Template}}(.+?){{\/Template}}/g)
      if (tagged) {
        let wikitext = tagged[0].substr(12, tagged[0].length - 25)
        Object.keys(params).forEach(param => {
          const re = new RegExp(`{{{${param}}}}`, 'g')
          wikitext = wikitext.replace(re, params[param])
        })
        templates.push({ match, wikitext })
      }
    }
  }
  return templates
}

/**
 * Replaces template calls with the values of those templates. For example, if
 * there is a page called "Example Template" that is of type "Template," then
 * {{Example Template}} in wikitext will be replaced with the contentss of that
 * page.
 * @param wikitext {string} - Wikitext to parse for templates.
 * @param db {Pool} - A database connection.
 * @returns {Promise<*>} - A promise that resolves with wikitext where template
 *   calls have been replaced with the wikitext of the matching templates.
 */

const parseTemplates = async (wikitext, db) => {
  let templates = wikitext.match(/{{((.*?)\n?)*?}}/g)
  if (templates) {
    templates = await addTemplates(templates, db)
    templates.forEach(template => {
      wikitext = wikitext.replace(template.match, template.wikitext)
    })
  }
  return wikitext
}

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

/**
 * Parses {{Download}} templates to show file downloads.
 * @param wikitext {string} - The wikitest to parse.
 * @param db {Pool} - A database connection.
 * @returns {Promise<void>} - A promise that resolves with the wikitext, with
 *   each instance of {{Download}} replaced with an appropriate link.
 */

const parseDownload = async (wikitext, db) => {
  const matches = wikitext.match(/{{Download(.*?)}}/g)
  if (matches) {
    for (let match of matches) {
      let file = null
      const props = match.match(/\s(.*?)="(.*?)"\/?/g)
      if (props) {
        for (let prop of props) {
          const pair = prop.trim().split('=')
          if (Array.isArray(pair) && pair.length > 0 && pair[0] === 'file') {
            file = pair[1].substr(1, pair[1].length - 2)
          }
        }
      }
      if (file) {
        const pages = await Page.getPaths([ file ], db)
        if (pages) {
          const page = await Page.get(pages[0].path, db)
          const filesize = getFileSizeStr(page.file.size)
          const url = `https://s3.${config.aws.region}.amazonaws.com/${config.aws.bucket}/${page.file.name}`
          const name = `<span class="label">${page.file.name}</span>`
          const size = `<span class="details">${page.file.mime}; ${filesize}</span>`
          const markup = `<a href="${url}" class="download">${name}${size}</a>`
          wikitext = wikitext.replace(match, markup)
        }
      }
    }
  }
  return wikitext
}

/**
 * Replaces {{Children}} in wikitext with a list of child pages.
 * @param wikitext {string} - The wikitext to parse.
 * @param path {string} - The path of the page to that we will be looking for
 *   child pages relative to.
 * @param db {Pool} - A database connection.
 * @param gallery {boolean} - If `true`, it looks for the {{Gallery}} tag,
 *   matches only pages of type 'Art', and displays thumbnails. If `false`,
 *   the type parameter is used normally and a regular bulleted list of child
 *   pages is returned (default: `false`).
 * @returns {Promise<*>} - A promise that resolves with the transformed
 *   wikitext, with <children /> replaced with a list of children.
 */

const listChildren = async (wikitext, path, db, gallery = false) => {
  const regex = gallery ? /{{Gallery(.*?)}}/g : /{{Children(.*?)}}/g
  const matches = wikitext.match(regex)
  if (matches) {
    for (let match of matches) {
      let type = gallery ? 'Art' : null
      let limit = null
      let order = gallery ? 'newest' : null

      const props = match.match(/\s(.*?)="(.*?)"\/?/g)
      if (props) {
        for (let prop of props) {
          const pair = prop.trim().split('=')
          if (Array.isArray(pair) && pair.length > 0 && pair[0] === 'of') {
            path = pair[1].substr(1, pair[1].length - 2)
          } else if (Array.isArray(pair) && pair.length > 0 && pair[0] === 'type') {
            type = pair[1].substr(1, pair[1].length - 2)
          } else if (Array.isArray(pair) && pair.length > 0 && pair[0] === 'order') {
            order = pair[1].substr(1, pair[1].length - 2)
          } else if (Array.isArray(pair) && pair.length > 0 && pair[0] === 'limit') {
            const val = parseInt(pair[1].substr(1, pair[1].length - 2))
            if (!isNaN(val)) limit = val
          }
        }
      }

      const parent = await Page.get(path, db)
      const children = parent ? await parent.getChildren(db, type, limit, order) : false
      const imgBase = `https://s3.${config.aws.region}.amazonaws.com/${config.aws.bucket}`
      let markup = ''
      if (children && gallery) {
        const items = children
          .filter(child => (child.path && child.title && child.thumbnail))
          .map(child => `<li><a href="${child.path}"><img src="${imgBase}/${child.thumbnail}" alt="${child.title}" /></a>`)
        markup = items ? `<ul class="gallery">${items.join('')}</ul>` : ''
      } else if (children) {
        const items = children.map(child => `\n* [[${child.path} ${child.title}]]`)
        markup = items ? items.join('') : ''
      }
      wikitext = wikitext.replace(match, markup)
    }
  }
  return wikitext
}

/**
 * Searches wikitext for incidents of the string `{{Artists}}`. If any are
 * found, obtains a list of all pages with `type` equal to `Artist` and lists
 * them along with a `{{Gallery}}` template limited to four of their children.
 * @param wikitext {string} - The wikitext string to parse.
 * @param db {Pool} - A database connection.
 * @returns {Promise<*>} - A promise that resolves with the processed wikitext.
 */

const listArtists = async (wikitext, db) => {
  const matches = wikitext.match(/{{Artists}}/g)
  if (matches) {
    const artists = await db.run('SELECT title, path FROM pages WHERE type=\'Artist\' ORDER BY title ASC;')
    const list = artists.map(artist => `<section class="artist"><h2><a href="${artist.path}">${artist.title}</a></h2>\n{{Gallery of="${artist.path}" limit="4"}}\n</section>`)
    const markup = await listChildren(list.join('\n'), '/art', db, true)
    wikitext = wikitext.replace(/{{Artists}}/gi, markup)
  }
  return wikitext
}

/**
 * Removes all mailto: links from a string of markup, replacing each with the
 * text of the link.
 * @param markup {string} - A string of markup.
 * @returns {*} - The same string of markup given, but with any mailto: links
 *   replaced with just the text inside the link, with the link itself
 *   removed.
 */

const doNotEmail = markup => {
  return markup.replace(/<a href=\"mailto:(.*?)\">(.*?)<\/a>/g, '$2')
}

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

    // Stuff that we need to check with the database on...
    wikitext = await parseTemplates(wikitext, db)
    wikitext = await parseDownload(wikitext, db)
    wikitext = await listChildren(wikitext, path, db, true)
    wikitext = await listChildren(wikitext, path, db)
    wikitext = await parseLinks(wikitext, db)

    // Render Markdown...
    wikitext = marked(wikitext.trim())
    wikitext = await listArtists(wikitext, db)
    wikitext = doNotEmail(wikitext)
    return wikitext
  } else {
    return false
  }
}

export default parse
