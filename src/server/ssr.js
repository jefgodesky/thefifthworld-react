import serialize from 'serialize-javascript'

/**
 * Renders the core `<head>` elements for each page.
 * @param title {string} - The content of the page's `<title>` tag.
 * @param desc {string} - A description for the page.
 * @returns {string} - The rendered markup for a section of the page's `<head>`
 */

const core = (title, desc) => {
  return `<title>${title}</title>
    <link rel="apple-touch-icon" sizes="180x180" href="https://s3.amazonaws.com/thefifthworld/website/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="https://s3.amazonaws.com/thefifthworld/website/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="https://s3.amazonaws.com/thefifthworld/website/favicon-16x16.png" />
    <link rel="manifest" href="https://s3.amazonaws.com/thefifthworld/website/manifest.json" />
    <link rel="mask-icon" href="https://s3.amazonaws.com/thefifthworld/website/safari-pinned-tab.svg" color="#5bbad5" />
    <meta name="theme-color" content="#ffffff" />

    <link rel="stylesheet" media="all" href="/css/style.css" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${desc}" />`
}

/**
 * Renders the Twitter card metadata tags for a page's `<head>` element.
 * @param meta {Object} - An object that can add optional Twitter card metadata
 *   tags besides the title, description, and image.
 * @param title {string} - The title of the page.
 * @param description {string} - A description of the page.
 * @param image {string} - The URL of an image to use for the Twitter card for
 *   this page.
 * @returns {string} - The rendered output for the page's Twitter card metadata
 *   tags.
 */

const twitter = (meta, title, description, image) => {
  const val = Object.assign({}, {
    title,
    description,
    image,
    card: 'summary_large_image',
    site: '@thefifthworld'
  }, meta)

  return `    <!-- Twitter Card data -->
    <meta name="twitter:title" content="${val.title}" />
    <meta name="twitter:card" content="${val.card}" />
    <meta name="twitter:site" content="${val.site}" />
    <meta name="twitter:description" content="${val.description}" />
    <meta name="twitter:image" content="${val.image}" />`
}

/**
 * Renders the Open Graph metadata tags for a page's `<head>` element (used by
 * Facebook).
 * @param meta {Object} - An object that can add optional Open Graph metadata
 *   tags besides the title, description, and image.
 * @param title {string} - The title of the page.
 * @param description {string} - A description of the page.
 * @param image {string} - The URL of an image to use for Open Graph for this
 *   page.
 * @returns {string} - The rendered output for the page's Open Graph metadata
 *   tags.
 */

const og = (meta, title, description, image) => {
  const val = Object.assign({}, {
    title,
    description,
    image,
    siteName: 'The Fifth World',
    type: 'website',
    url: 'https://thefifthworld.com',
    appId: 241682169673933
  }, meta)

  return `    <!-- Open Graph data -->
    <meta property="og:title" content="${val.title}" />
    <meta property="og:site_name" content="${val.siteName}" />
    <meta property="og:type" content="${val.type}" />
    <meta property="og:url" content="${val.url}" />
    <meta property="og:description" content="${val.description}" />
    <meta property="og:image" content="${val.image}" />
    <meta property="fb:app_id" content="${val.appId}" />`
}

/**
 * Renders any properties passed in the `meta` object that aren't expected
 * (`title`, `description`, `twitter`, and `og`) as separate meta tags.
 * @param meta {Object} - An object that may contain additional meta tag
 *   content.
 * @returns {string} - Rendered output of any additional meta tags.
 */

const other = meta => {
  let other = ''

  if (meta) {
    const expected = ['title', 'description', 'twitter', 'og']
    const custom = []
    Object.keys(meta).forEach(key => {
      if (!expected.includes(key)) custom.push(key)
    })

    if (custom.length > 0) {
      other = '    <!-- Other -->'
      custom.forEach(key => {
        other = other + `\n    <meta name="${key}" content="${meta[key]}" />`
      })
    }
  }

  return other
}

/**
 * Returns rendered output of a page's `<head>` element.
 * @param meta {Object} - A collection of information to include in the
 *   `<head>` element.
 * @returns {string} - Rendered output for the page's `<head>` element.
 */

const head = meta => {
  const defaultDesc = 'Four centuries from now, humanity thrives beyond civilization.'
  const defaultImg = 'https://s3.amazonaws.com/thefifthworld/website/images/social/default.jpg'
  const title = meta ? meta.title ? meta.title : 'The Fifth World' : 'The Fifth World'
  const desc = meta ? meta.description ? meta.description : defaultDesc : defaultDesc
  const img = meta ? meta.image ? meta.image : defaultImg : defaultImg
  const metaTwitter = meta ? meta.twitter : {}
  const metaOg = meta ? meta.og : {}

  const sections = {
    core: core(title, desc),
    twitter: twitter(metaTwitter, title, desc, img),
    og: og(metaOg, title, desc, img),
    other: other(meta)
  }

  sections.arr = [sections.core, sections.twitter, sections.og]
  if (sections.other.length > 0) sections.arr.push(sections.other)
  return sections.arr.join('\n\n')
}

/**
 * Returns the markup for the page.
 * @param markup {string} - The rendered markup for the body of the page.
 * @param meta {Object} - An object that contains all of the information unique
 *   to this page that should be represented in its `<head>` element.
 * @param store {Object} - The Redux store to pass into the initial state.
 * @returns {string} - The markup for the page.
 */

const getMarkup = (markup, meta, store) => {
  const state = (store.getState && (typeof store.getState === 'function')) ? store.getState() : store
  const init = serialize(state)
  return `<!DOCTYPE html>
<html>
  <head>
    ${head(meta)}
  </head>
  <body>
    <div id="root">${markup}</div>
    <script>window.__INITIAL_STATE__ = ${init}</script>
    <script src="/bundle.js" defer="defer"></script>
  </body>
</html>`
}

export default getMarkup
