import slugify from '../slugify'
import { updateVals } from '../../server/utils'
import { escape as SQLEscape } from 'sqlstring'
import { checkPermissions, canRead, canWrite } from '../permissions'

/**
 * This model handles dealing with pages in the database.
 */

class Page {
  constructor (page, changes) {
    this.id = page.id
    this.title = page.title
    this.slug = page.slug
    this.path = page.path
    this.parent = page.parent
    this.type = page.type
    this.file = page.file
    this.permissions = page.permissions.toString()
    this.owner = page.owner
    this.depth = page.depth
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
   * Returns the value of the first [[Type:X]] tag in the string provided, or
   * null if no such tag is found.
   * @param str {string} - The string to find the type tags in.
   * @returns {*} - If the given string str includes one or more tags formatted
   *   as [[Type:X]], it returns the string "X" for the first such tag. If such
   *   a tag could not be found, returns a null.
   */

  static getType (str) {
    const matches = str.match(/\[\[Type:(.+?)\]\]/g)
    if (matches && matches.length > 0) {
      const first = matches[0].substr(2, matches[0].length - 4).split(':')
      return first[0] === 'Type' ? first[1] : null
    } else {
      return null
    }
  }

  /**
   * Returns a path for a page by combining the path of its parent
   * concatenated with its own slug.
   * @param data {Object} - An object that should include a `slug` property
   *   (preferred), or else a `title` property that can be slugified.
   * @param parent {Page|int} - Either a Page object for the parent page, or
   *   the ID of the parent page.
   * @param db {Pool} - A database connection.
   * @returns {Promise} - A promise that resolves with a path for the page.
   */

  static async getPath (data, parent, db) {
    const par = await Page.get(parent, db)
    const slug = data.slug ? data.slug : data.title ? slugify(data.title) : null
    if (slug) {
      return par && par.path
        ? `${par.path}/${slug}`
        : `/${slug}`
    } else {
      return false
    }
  }

  /**
   * Creates a new page.
   * @param data {Object} - An object defining the data for the page. Expected
   *   properties include `path` (for the page's path), `title` (for the page's
   *   title), and `body` (for the wikitext of the page's main content).
   * @param editor {Member} - The member creating the page. This object must at
   *   least include an `id` property specifying the editor's member ID.
   * @param msg {string} - A commit message.
   * @param db {Pool} - A database connection.
   * @returns {Promise} - A promise that resolves with the newly created Page
   *   instance once it has been added to the database.
   */

  static async create (data, editor, msg, db) {
    // Figure out values
    const slug = data.slug ? data.slug : slugify(data.title)
    const parent = data.parent ? await Page.get(data.parent, db) : null
    const pid = parent ? parent.id : 0
    const path = data.path ? data.path : await Page.getPath(data, parent, db)
    const title = data.title ? data.title : ''
    const permissions = data.permissions ? data.permissions : 774
    const depth = parent ? parent.depth + 1 : 0
    const type = data.type ? data.type : Page.getType(data.body)

    // Add to database
    try {
      const res = await db.run(`INSERT INTO pages (slug, path, parent, type, title, permissions, owner, depth) VALUES ('${slug}', '${path}', ${pid}, '${type}', '${title}', ${permissions}, ${editor.id}, ${depth});`)
      const id = res.insertId
      await db.run(`INSERT INTO changes (page, editor, timestamp, msg, json) VALUES (${id}, ${editor.id}, ${Math.floor(Date.now() / 1000)}, ${SQLEscape(msg)}, ${SQLEscape(JSON.stringify(data))});`)
      return Page.get(id, db)
    } catch (err) {
      throw err
    }
  }

  /**
   * Returns a page from the database.
   * @param id {int|string|Page} - The ID or the path of a page, or a Page
   *   instance (in which case, it simply returns the page). This allows the
   *   method to take a wide range of identifiers and reliably return the
   *   correct object.
   * @param db {Pool} - A database connection.
   * @returns {Promise} - A promise that resolves with the Page object if it
   *   can be found, or a `null` if it could not be found.
   */

  static async get (id, db) {
    if (id && id.constructor && id.constructor.name === 'Page') {
      // You were passed a page already; just return it
      return id
    } else if (id) {
      // Query db with either an ID or a path (string)
      const pages = (typeof id === 'string')
        ? await db.run(`SELECT * FROM pages WHERE path='${id}';`)
        : await db.run(`SELECT * FROM pages WHERE id=${id};`)
      if (pages.length === 1) {
        // We found a page, so get its changes...
        const changes = await db.run(`SELECT c.id AS id, c.timestamp AS timestamp, c.msg AS msg, c.json AS json, m.name AS editorName, m.email AS editorEmail, m.id AS editorID FROM changes c, members m WHERE c.editor=m.id AND c.page=${pages[0].id} ORDER BY c.timestamp DESC;`)
        changes.reverse()
        // And see if it has any files...
        const files = await db.run(`SELECT * FROM files WHERE page=${pages[0].id} ORDER BY timestamp DESC;`)
        if (files) pages[0].file = files[0]
        return new Page(pages[0], changes)
      } else {
        // Either no pages found, or too many (which should never happen).
        return null
      }
    } else {
      // We weren't given an ID to look for, so null
      return null
    }
  }

  /**
   * This method returns whether or not the person provided has a given type of
   * permissions for this page.
   * @param person {Member|null} - This parameter expects a Member object, or
   *   at least an object with the same properties. If given something else, it
   *   will evaluate permissions based on other (world) permissions.
   * @param level {int} - This parameter defines the type of permission
   *   requested: 4 to read or 6 to read and write.
   * @returns {boolean} - Returns `true` if the person given has the type of
   *   permissions requested, or `false` if she does not.
   */

  checkPermissions (person, level) {
    return checkPermissions(person, this, level)
  }

  /**
   * This is a convenience method that can check if a person has read
   *   permissions for the page specifically.
   * @param person {Member|null} - This parameter expects a Member object, or
   *   at least an object with the same properties. If given something else, it
   *   will evaluate permissions based on other (world) permissions.
   * @returns {boolean} - Returns `true` if the person given has read
   *   permissions, or `false` if she does not.
   */

  canRead (person) {
    return canRead(person, this)
  }

  /**
   * This is a convenience method that can check if a person has read and write
   *   permissions for the page specifically.
   * @param person {Member|null} - This parameter expects a Member object, or
   *   at least an object with the same properties. If given something else, it
   *   will evaluate permissions based on other (world) permissions.
   * @returns {boolean} - Returns `true` if the person given has read and write
   *   permissions, or `false` if she does not.
   */

  canWrite (person) {
    return canWrite(person, this)
  }

  /**
   * Update a page.
   * @param data {Object} - An object defining the data for the page. Expected
   *   properties include `path` (for the page's path), `title` (for the page's
   *   title), and `body` (for the wikitext of the page's main content).
   * @param editor {Member} - The member creating the page.
   * @param msg {string} - A commit message.
   * @param db {Pool} - A database connection.
   * @returns {Promise} - A promise that resolves once the page has been
   *   updated.
   */

  async update (data, editor, msg, db) {
    // What updates do we need to make to the page itself?
    const inPage = ['title', 'slug', 'path', 'parent', 'permissions', 'owner', 'type']
    const update = {}
    for (const key of inPage) {
      if (data[key] && this[key] !== data[key]) {
        if (key === 'parent') {
          const parent = await Page.get(data.parent, db)
          update.parent = parent && parent.id ? parent.id : 0
          update.depth = parent && !isNaN(parent.depth) ? parent.depth + 1 : this.depth
        } else if (key === 'path') {
          const path = data.path.split('/')
          update.slug = (path.length > 0) ? path.pop() : this.slug
          update.path = data.path
        } else if (key === 'permissions') {
          update.permissions = data.permissions.toString()
        } else {
          update[key] = data[key]
        }
      }
    }

    if (data.body) {
      const type = data.type ? data.type : Page.getType(data.body)
      if (type && this.type !== type) update.type = type
    }

    // Update this object
    Object.keys(update).forEach(key => { this[key] = update[key] })

    // Update the pages table in the database
    const fields = [
      { name: 'title', type: 'string' },
      { name: 'slug', type: 'string' },
      { name: 'path', type: 'string' },
      { name: 'parent', type: 'number' },
      { name: 'type', type: 'string' },
      { name: 'permissions', type: 'number' },
      { name: 'owner', type: 'number' },
      { name: 'depth', type: 'number' }
    ]
    const vals = updateVals(fields, update)

    try {
      if (vals !== '') await db.run(`UPDATE pages SET ${vals} WHERE id=${this.id};`)

      // Track changes
      const timestamp = Math.floor(Date.now() / 1000)
      const res = await db.run(`INSERT INTO changes (page, editor, timestamp, msg, json) VALUES (${this.id}, ${editor.id}, ${timestamp}, ${SQLEscape(msg)}, ${SQLEscape(JSON.stringify(data))});`)

      // Add change to this instance
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
    } catch (err) {
      throw err
    }
  }

  /**
   * Rollback a page to a previous version.
   * @param id {int} - The ID of the version to roll back to.
   * @param editor {Member} - The Member instance of the person rolling back
   *   the page.
   * @param db {Pool} - A database connection.
   * @returns {Promise} - A promise that resolves when the page has been rolled
   *   back.
   */

  async rollbackTo (id, editor, db) {
    const target = this.changes.filter(r => r.id === id)
    if (target.length === 1) {
      const msg = `Rollback to change #${id}`
      await this.update(target[0].content, editor, msg, db)
    }
  }

  /**
   * Returns the page content as of the latest version.
   * @returns {Object} - The data object saved with the latest version of the
   *   page.
   */

  getContent () {
    return this.changes[0].content
  }

  /**
   * Recursively loads all of the pages in the page's lineage.
   * @param db {Pool} - A database connection.
   * @returns {Promise} - A promise that resolves with an array of all of the
   *   page's ancestors (the first element is the page's parent; the second is
   *   that page's parent, and so on).
   */

  async getLineage (db) {
    if (this.parent === 0) {
      return []
    } else {
      const parent = await Page.get(this.parent, db)
      const ancestors = await parent.getLineage(db)
      return [parent, ...ancestors]
    }
  }

  /**
   * Returns the page's direct child pages.
   * @param db {Pool} - A database connection.
   * @param type {string} - If provided, only child pages of this type will
   *   be returned.
   * @returns {Promise<*>} - A promise that resolves with an array of all of
   *   the page's direct child pages.
   */

  async getChildren (db, type = null) {
    if (type) {
      return db.run(`SELECT title, path FROM pages WHERE parent=${this.id} AND type='${type}';`)
    } else {
      return db.run(`SELECT title, path FROM pages WHERE parent=${this.id};`)
    }
  }

  /**
   * Returns an array of results with titles that the provided string appears
   * in.
   * @param str {string} - The string to search for.
   * @param db {Pool} - A database connection.
   * @returns {Promise} - A promise that resolves with the results of a
   *   database query for all pages with titles that the `str` string appears
   *   in.
   */

  static async autocomplete (str, db) {
    const escaped = SQLEscape(str)
    const like = escaped.substr(1, escaped.length - 2)
    return db.run(`SELECT * FROM pages WHERE title LIKE '%${like}%' LIMIT 5;`)
  }

  /**
   * This method takes an array of strings, `arr`, and searches the database
   * for pages with titles or paths that match those strings. It returns an
   * array that includes an object for each page found. Each object includes a
   * `title` and a `path` property.
   * @param arr {Array} - An array of strings specifying the titles or paths of
   *   the pages you'd like to return.
   * @param db {Pool} - A database connection.
   * @returns {Promise} - A promise that resolves with an array of objects.
   */

  static async getPaths (arr, db) {
    const map = arr.map(s => SQLEscape(s)).join(', ')
    return db.run(`SELECT title, path FROM pages WHERE title IN (${map}) OR path IN (${map}) ORDER BY depth, id;`)
  }
}

export default Page
