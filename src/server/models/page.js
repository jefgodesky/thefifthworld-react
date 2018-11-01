import { slugify, updateVals } from '../utils'
import { escape as SQLEscape } from 'sqlstring'

/**
 * This model handles dealing with pages in the database.
 */

const types = [ 'wiki', 'group', 'person', 'place', 'art', 'story' ]

class Page {
  constructor (page, changes) {
    this.id = page.id
    this.title = page.title
    this.path = page.path
    this.parent = page.parent
    this.type = page.type
    this.active = Boolean(page.active)
    this.locked = Boolean(page.locked)
    this.changes = []

    changes.forEach(change => {
      this.changes.unshift({
        id: change.id,
        timestamp: new Date(change.timestamp * 1000),
        msg: change.msg,
        content: JSON.parse(change.json),
        editor: {
          name: change.editorName
            ? change.editorName
            : change.editorEmail
              ? change.editorEmail
              : `Member #${change.editorID}`,
          id: change.editorID
        }
      })
    })
  }

  /**
   * Creates a new page.
   * @param data {Object} - An object defining the data for the page. Expected
   *   properties include `path` (for the page's path), `type` (for the type of
   *   the page), `title` (for the page's title), and `body` (for the wikitext
   *   of the page's main content).
   * @param editor {Member} - The member creating the page. This object must at
   *   least include an `id` property specifying the editor's member ID.
   * @param msg {string} - A commit message.
   * @param db {Pool} - A database connection.
   * @returns {Promise} - A promise that resolves with the newly created Page
   *   instance once it has been added to the database.
   */

  static async create (data, editor, msg, db) {
    const path = data.path ? data.path : `/${slugify(data.title)}`
    const title = data.title ? data.title : ''
    const type = data.type && types.indexOf(data.type) > -1 ? data.type : 'wiki'
    const res = await db.run(`INSERT INTO pages (path, title, type) VALUES ('${path}', '${title}', '${type}');`)
    const page = res.insertId
    await db.run(`INSERT INTO changes (page, editor, timestamp, msg, json) VALUES (${page}, ${editor.id}, ${Math.floor(Date.now()/1000)}, ${SQLEscape(msg)}, ${SQLEscape(JSON.stringify(data))});`)
    return Page.get(page, db)
  }

  /**
   * Returns a page from the database.
   * @param id {int|string} - Either the ID or the path of a page.
   * @param db {Pool} - A database connection.
   * @returns {Promise} - A promise that resolves with the Page object if it
   *   can be found, or a `null` if it could not be found.
   */

  static async get (id, db) {
    const pages = (typeof id === 'string')
      ? await db.run(`SELECT * FROM pages WHERE path='${id}';`)
      : await db.run(`SELECT * FROM pages WHERE id=${id};`)
    if (pages.length === 1) {
      const changes = await db.run(`SELECT c.id AS id, c.timestamp AS timestamp, c.msg AS msg, c.json AS json, m.name AS editorName, m.email AS editorEmail, m.id AS editorID FROM changes c, members m WHERE c.editor=m.id AND c.page=${pages[0].id} ORDER BY c.timestamp DESC;`)
      return new Page(pages[0], changes)
    } else {
      return null
    }
  }

  /**
   * Update a page.
   * @param data {Object} - An object defining the data for the page. Expected
   *   properties include `path` (for the page's path), `type` (for the type of
   *   the page), `title` (for the page's title), and `body` (for the wikitext
   *   of the page's main content).
   * @param editor {Member} - The member creating the page.
   * @param msg {string} - A commit message.
   * @param db {Pool} - A database connection.
   * @returns {Promise} - A promise that resolves once the page has been
   *   updated.
   */

  async update (data, editor, msg, db) {
    if (data.title || data.path) {
      const fields = [
        { name: 'title', type: 'string' },
        { name: 'path', type: 'path' }
      ]
      await db.run(`UPDATE pages SET ${updateVals(fields, data)} WHERE id=${this.id};`)
      if (data.title) this.title = data.title
      if (data.path) this.path = data.path
    }

    const timestamp = Math.floor(Date.now()/1000)
    const res = await db.run(`INSERT INTO changes (page, editor, timestamp, msg, json) VALUES (${this.id}, ${editor.id}, ${timestamp}, ${SQLEscape(msg)}, ${SQLEscape(JSON.stringify(data))});`)
    this.changes.unshift({
      id: res.insertId,
      timestamp,
      msg,
      content: data,
      editor: {
        name: editor.getName(),
        id: editor.id
      }
    })
  }

  /**
   * Returns the page content as of the latest version.
   * @returns {Object} - The data object saved with the latest version of the
   *   page.
   */

  getContent () {
    return this.changes[0].content
  }
}

export default Page
