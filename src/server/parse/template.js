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
    const name = tpl.substr(2, tpl.length - 4).replace(/\s(.*?)=["“”](.*?)["“”]/g, '')

    // What are the parameters?
    const paramStrings = tpl.match(/\s(.*?)=["“”](.*?)["“”]/g)
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

const modifyTemplatesInBlocks = (wikitext, before, after) => {
  const blocks = wikitext.match(/\`\`\`(\n|\r|.)*\`\`\`/gm)
  if (blocks) {
    for (const block of blocks) {
      const templates = block.match(before.regex)
      if (templates) {
        let newBlock = block
        for (const template of templates) {
          const clip = template.substring(before.begin, template.length - before.end)
          newBlock = newBlock.replace(template, `${after.begin}${clip}${after.end}`)
        }
        wikitext = wikitext.replace(block, newBlock)
      }
    }
  }
  return wikitext
}

/**
 * Escape template calls that are inside code blocks.
 * @param wikitext {string} - Wikitext to parse.
 * @returns {string} - A copy of the wikitext with any template calls that are
 *   inside code blocks escaped.
 */

const escapeTemplatesInCodeBlocks = wikitext => {
  const before = { regex: /{{(\n|\r|.)*}}/gm, begin: 2, end: 2 }
  const after = { begin: '<EscapedTemplate>', end: '</EscapedTemplate>' }
  return modifyTemplatesInBlocks(wikitext, before, after)
}

const unescapeTemplatesInCodeBlocks = wikitext => {
  const before = { regex: /<EscapedTemplate>(\n|\r|.)*<\/EscapedTemplate>/gm, begin: 17, end: 18 }
  const after = { begin: '{{', end: '}}' }
  return modifyTemplatesInBlocks(wikitext, before, after)
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
  wikitext = escapeTemplatesInCodeBlocks(wikitext)
  let templates = wikitext.match(/{{((.*?)\n?)*?}}/gm)
  if (templates) {
    templates = await addTemplates(templates, db)
    templates.forEach(template => {
      wikitext = wikitext.replace(template.match, template.wikitext)
    })
  }
  return unescapeTemplatesInCodeBlocks(wikitext)
}

export default parseTemplates
