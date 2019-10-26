import Page from '../../shared/models/page'
import { getURL, getProps } from './utils'
import { isPopulatedArray, getFileSizeStr } from '../../shared/utils'
import slugify from '../../shared/slugify'

/**
 * Escapes all of the characters inside of a <pre><code> block.
 * @param wikitext {string} - Wikitext to process.
 * @returns {*} - The same wikitext, but with the contents of any <pre><code>
 *   blocks escaped.
 */

const escapeCodeBlockMarkdown = wikitext => {
  const blocks = wikitext.match(/<pre>\s*<code>((.|\s)*?)<\/code>\s*<\/pre>/gm)
  if (isPopulatedArray(blocks)) {
    for (const block of blocks) {
      const match = block.match(/<pre>\s*<code>((.|\s)*?)<\/code>\s*<\/pre>/m)
      if (match && match.length > 1) {
        const content = match[1].trim()
          .replace(/&lt;/gi, '<')
          .replace(/&gt;/gi, '>')
          .replace(/&amp;/gi, '&')
          .replace(/“/gi, '"')
          .replace(/”/gi, '"')
          .replace(/‘/gi, '\'')
          .replace(/’/gi, '\'')
        let escaped = ''
        for (let i = 0; i < content.length; i++) {
          if (content.charCodeAt(i) === 10) {
            escaped += '\n'
          } else if (content.charCodeAt(i) > 31) {
            escaped += `&#${content.charCodeAt(i)};`
          }
        }
        wikitext = wikitext.replace(block, `<pre><code>${escaped}</code></pre>`)
      }
    }
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
    const caption = image.props.caption ? `<figcaption>${image.props.caption}</figcaption>` : null
    const img = image.props.thumbnail && image.page.file.thumbnail
      ? `<img src="${getURL(image.page.file.thumbnail)}" alt="${image.props.caption}" />`
      : `<img src="${getURL(image.page.file.name)}" alt="${image.props.caption}" />`
    const link = `<a href="${image.page.path}">${img}</a>`
    const markup = caption ? `<figure>${link}${caption}</figure>` : `<figure>${link}</figure>`
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
        const tag = props.ordered ? 'ol' : 'ul'
        markup = items ? `<${tag}>\n${items.join('\n')}\n</${tag}>` : ''
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
 * Removes all special tags from the text.
 * @param wikitext {string} - Wikitext to parse.
 * @returns {string} - Text without special tags.
 */

const parseTags = wikitext => {
  const regexes = [
    /\[\[Type:(.*?)\]\]/g,
    /\[\[Location:(.*?)\]\]/g,
    /\[\[Owner:(.*?)\]\]/g,
    /\[\[Knower:(.*?)\]\]/g,
    /\[\[Author:(.*?)\]\]/g,
    /\[\[Artist:(.*?)\]\]/g,
    /\[\[Chapter:(.*?)\]\]/g
  ]
  for (const regex of regexes) {
    wikitext = wikitext.replace(regex, '').replace(/\ +/g, ' ').trim()
  }
  return wikitext
}

/**
 * Replaces {{Form}} tags with forms.
 * @param wikitext {string} - Wikitext to parse.
 * @returns {string} - Text with {{Form}} tags replaced with rendered HTML for
 *   forms.
 */

const parseForm = wikitext => {
  const matches = wikitext.match(/{{Form((.|\n)*?)}}(.|\s)*?{{\/Form}}/gm) || []
  for (const match of matches) {
    const form = match.match(/{{Form((.|\n)*?)}}/m)
    const formParams = form && form[1] ? getProps(form[1]) : {}
    let fields = match.match(/{{Field((.|\s)*?)}}/gm) || []
    fields = fields.map(f => getProps(f))

    let markup = '<form action="/save-form" method="post">\n'
    markup += `  <input type="hidden" name="form" value="${formParams.Name}" />\n`
    for (const field of fields) {
      const id = slugify(`${formParams.Name} ${field.Label}`)
      const type = field.Type || 'text'

      if (field.Note) {
        markup += `  <label for="${id}">\n`
        markup += `    ${field.Label}\n`
        markup += `    <p class="note">${field.Note}</p>\n`
        markup += `  </label>\n`
      } else {
        markup += `  <label for="${id}">${field.Label}</label>\n`
      }

      if (type === 'textarea') {
        markup += `  <textarea name="${slugify(field.Label)}" id="${id}"></textarea>\n`
      } else {
        markup += `  <input type="${type}" name="${slugify(field.Label)}" id="${id}" />\n`
      }
    }

    markup += `  <button>${formParams.Button || 'Send'}</button>\n`
    markup += '</form>'

    wikitext = wikitext.replace(match, markup)
  }
  return wikitext
}

/**
 * ?
 * @param wikitext
 * @param db
 * @returns {Promise<void>}
 */

const parseNovelListing = async (wikitext, db) => {
  const matches = wikitext.match(/{{ListNovels(.*?)}}/g) || []
  const res = matches && matches.length > 0
    ? await db.run('SELECT n.title, n.path, f.name AS src FROM pages n, pages c, files f WHERE n.type=\'Novel\' AND c.type=\'Art\' AND c.path=n.path+\'/cover\' AND c.parent=n.id AND f.page=c.id;')
    : null

  let markup = ''
  if (isPopulatedArray(res)) {
    markup = '<ul class="novel-listing">\n'
    for (const novel of res) {
      markup += '  <li>\n'
      markup += `    <a href="${novel.path}">\n`
      markup += `      <img src="${getURL(novel.src)}" alt="${novel.title}" />`
      markup += '    </a>\n'
      markup += '  </li>\n'
    }
    markup += '</ul>'
  }

  for (const match of matches) {
    wikitext = wikitext.replace(match, markup)
  }

  return wikitext
}

/**
 * Unwraps <div> tags that are wrapped in <p> tags.
 * @param wikitext {string} - Wikitext to parse.
 * @returns {string} - A copy of the wikitext, but in each instance where one
 *   or more <div> tags are wrapped inside of a <p> tag, the <p> tag is
 *   replaced by the <div> tags. If the <p> tag includes other children besides
 *   the <div> tags, it is preserved.
 */

const unwrapDivs = wikitext => {
  const paragraphs = wikitext.match(/<p.*?>(.|\n)*?<\/p>/gm)
  if (isPopulatedArray(paragraphs)) {
    for (let p of paragraphs) {
      const match = p.match(/<p.*?>((.|\n)*?)<\/p>/m)
      const text = (isPopulatedArray(match) && match.length > 1) ? match[1] : null
      const divs = text ? text.match(/<div.*?>((.|\n)*?)<\/div>/gm) : null
      if (isPopulatedArray(divs)) {
        let test = text
        for (let div of divs) test = test.replace(div, '')
        if (test.trim() === '') wikitext = wikitext.replace(p, text)
      }
    }
  }
  return wikitext
}

export {
  escapeCodeBlockMarkdown,
  listChildren,
  listArtists,
  doNotEmail,
  parseDownload,
  parseArt,
  parseTags,
  parseForm,
  parseNovelListing,
  unwrapDivs
}
