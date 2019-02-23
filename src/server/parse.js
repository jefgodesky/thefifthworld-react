import marked from 'marked'
import Page from '../shared/models/page'
import slugify from '../shared/slugify'

marked.setOptions({
  sanitize: true,
  sanitizer: markup => {
    const allowedHTML = 'strong em ul ol li a pre code img div ins del sup sub table thead tbody tfoot blockquote dl dt dd tr td th span strike'.split(' ')
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
    const name = match.substr(2, match.length - 4)
    const res = await db.run(`SELECT c.json AS json FROM changes c, pages p WHERE p.id=c.page AND p.type='Template' AND p.title='${name}' ORDER BY p.depth ASC, c.timestamp DESC;`)
    if (res.length > 0) {
      const full = JSON.parse(res[0].json).body.replace(/\[\[Type:(.*?)\]\]/g, '').trim()
      const tagged = full.match(/<tpl>(.+?)<\/tpl>/g)
      if (tagged) {
        const wikitext = tagged[0].substr(5, tagged[0].length - 11)
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
  let templates = wikitext.match(/{{(.*?)}}/g)
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
 * Replaces <children /> in wikitext with a list of child pages.
 * @param wikitext {string} - The wikitext to parse.
 * @param path {string} - The path of the page to that we will be looking for
 *   child pages relative to.
 * @param db {Pool} - A database connection.
 * @returns {Promise<*>} - A promise that resolves with the transformed
 *   wikitext, with <children /> replaced with a list of children.
 */

const listChildren = async (wikitext, path, db) => {
  const matches = wikitext.match(/<children(.*?)/g)
  if (matches) {
    const parent = await Page.get(path, db)
    const children = parent ? await parent.getChildren(db) : false
    const items = children
      ? children.map(child => `<li><a href="${child.path}">${child.title}</a></li>`)
      : false
    const markup = items
      ? `<ul>\n${items.join('\n')}\n</ul>`
      : false
    wikitext = markup ? wikitext.replace(/<children(.*?)\/>/g, markup) : wikitext
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
    wikitext = wikitext.replace(/<tpl>(.*?)<\/tpl>/g, '') // Remove templates
    wikitext = wikitext.replace(/\[\[Type:(.*?)\]\]/g, '') // Remove [[Type:X]] tags

    // Stuff that we need to check with the database on...
    wikitext = await parseTemplates(wikitext, db)
    wikitext = await parseLinks(wikitext, db)
    wikitext = await listChildren(wikitext, path, db)

    // Render Markdown...
    wikitext = marked(wikitext.trim())
    wikitext = doNotEmail(wikitext)
    return wikitext
  } else {
    return false
  }
}

export default parse
