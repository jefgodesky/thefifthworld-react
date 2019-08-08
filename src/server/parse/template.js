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

export default parseTemplates
