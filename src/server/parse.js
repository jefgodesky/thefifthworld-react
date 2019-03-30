import marked from 'marked'
import Page from '../shared/models/page'
import slugify from '../shared/slugify'
import { getFileSizeStr } from '../shared/utils'
import config from '../../config'

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
 * Returns the absolute URL for an asset on Amazon AWS S3.
 * @param path {string} - The relative path of the asset.
 * @returns {string} - The absolute path for an asset on Amazon AWS S3.
 */

const getURL = path => {
  return `https://s3.${config.aws.region}.amazonaws.com/${config.aws.bucket}/${path}`
}

/**
 * Parses the properties or attributes used in a tag into an object, where each
 * attribute is a property, and the value of that attribute is the value of
 * that property.
 * @param tag {string} - The tag string.
 * @returns {Object} - An object representing the tag's properties.
 */

const getProps = tag => {
  const matches = tag.match(/\s(.*?)=”(.*?)”\/?/g)
  const props = {}
  if (matches) {
    for (let match of matches) {
      const pair = match.trim().split('=')
      if (Array.isArray(pair) && pair.length > 1) {
        const key = pair[0]
        const val = pair[1].substr(1, pair[1].length - 2)
        props[key] = val
      }
    }
  }
  return props
}

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
 * This method looks for tags in wikitext that refer to a page (per the `Page`
 * model's ``getPaths` method, which matches either names or paths) and
 * performs some operation (`op`) upon them.
 * @param wikitext {string} - The wikitext to parse.
 * @param regex {RegExp} - A regular expression defining what tag to find.
 * @param id {string} - The prop or attribute used by the tag to identify the
 *   intended page (e.g., in `{{Download file="Name"}}`, the `id` would be
 *   `file`.
 * @param db {Pool} - A database connection.
 * @returns {Promise<void>} - A promise that resolves with an array of objects.
 *   Each object in the array corresponds to one of the tags matched in the
 *   wikitext and includes three properties:
 *     * `page`:  The `Page` instance identified by the tag.
 *     * `match`: The string matched by the regular expression. Typically this
 *                is the string you want to replace.
 *     * `props`: An object representing all of the other properties or
 *                attributes defined by the tag.
 */

const matchFiles = async (wikitext, regex, id, db) => {
  const res = []
  const matches = wikitext.match(regex)
  if (matches) {
    for (let match of matches) {
      const props = getProps(match)
      if (props[id]) {
        const pages = await Page.getPaths([ props[id] ], db)
        if (pages) {
          const page = await Page.get(pages[0].path, db)
          res.push({ page, match, props })
        }
      }
    }
  }
  return res
}

/**
 * Parses {{Download}} templates to show file downloads.
 * @param wikitext {string} - The wikitest to parse.
 * @param db {Pool} - A database connection.
 * @returns {Promise<void>} - A promise that resolves with the wikitext, with
 *   each instance of {{Download}} replaced with an appropriate link.
 */

const parseDownload = async (wikitext, db) => {
  const downloads = await matchFiles(wikitext, /{{Download(}}|\s(.*?)}})/g, 'file', db)
  for (let download of downloads) {
    const filesize = getFileSizeStr(download.page.file.size)
    const url = getURL(download.page.file.name)
    const name = `<span class="label">${download.page.file.name}</span>`
    const size = `<span class="details">${download.page.file.mime}; ${filesize}</span>`
    const markup = `<a href="${url}" class="download">${name}${size}</a>`
    wikitext = wikitext.replace(download.match, markup)
  }
  return wikitext
}

/**
 * Parses {{Art}} templates to show images.
 * @param wikitext {string} - The wikitest to parse.
 * @param db {Pool} - A database connection.
 * @returns {Promise<void>} - A promise that resolves with the wikitext, with
 *   each instance of {{Art}} replaced with an appropriate figure and image.
 */

const parseArt = async (wikitext, db) => {
  const images = await matchFiles(wikitext, /{{Art(}}|\s(.*?)}})/g, 'src', db)
  for (let image of images) {
    const caption = `<figcaption>${image.props.caption}</figcaption>`
    const img = image.props.thumbnail && image.page.file.thumbnail
      ? `<img src="${getURL(image.page.file.thumbnail)}" alt="${image.props.caption}" />`
      : `<img src="${getURL(image.page.file.name)}" alt="${image.props.caption}" />`
    const markup = `<figure>${img}${caption}</figure>`
    wikitext = wikitext.replace(image.match, markup)
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
      const props = getProps(match)
      const type = props.type ? props.type : gallery ? 'Art' : null
      const order = props.order ? props.order : gallery ? 'newest' : null
      const limit = (props.limit && !isNaN(parseInt(props.limit))) ? parseInt(props.limit) : null
      if (props.of) path = props.of

      const parent = await Page.get(path, db)
      const children = parent ? await parent.getChildren(db, type, limit, order) : false
      let markup = ''
      if (children && gallery) {
        const items = children
          .filter(child => (child.path && child.title && child.thumbnail))
          .map(child => `<li><a href="${child.path}"><img src="${getURL(child.thumbnail)}" alt="${child.title}" /></a>`)
        markup = items ? `<ul class="gallery">\n${items.join('\n')}\n</ul>` : ''
      } else if (children) {
        const items = children.map(child => `<li><a href="${child.path}">${child.title}</a></li>`)
        markup = items ? `<ul>\n${items.join('\n')}\n</ul>` : ''
      }

      // Replace the match, unless it's wrapped in <p> tags, in which case,
      // replace those, too.
      const r = wikitext.match(`<p>${match}</p>`) ? `<p>${match}</p>` : match
      wikitext = wikitext.replace(r, markup)
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

    // Render templates.
    wikitext = await parseTemplates(wikitext, db)

    // Render Markdown...
    wikitext = marked(wikitext.trim())
    wikitext = await listArtists(wikitext, db)
    wikitext = doNotEmail(wikitext)

    // More stuff that we need to check with the database on, after Markdown
    // has been rendered.
    wikitext = await parseDownload(wikitext, db)
    wikitext = await parseArt(wikitext, db)
    wikitext = await listChildren(wikitext, path, db, true)
    wikitext = await listChildren(wikitext, path, db)
    wikitext = await parseLinks(wikitext, db)

    return wikitext
  } else {
    return false
  }
}

export default parse
