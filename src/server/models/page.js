import slugify from '../../shared/slugify'
import { updateVals } from '../utils'
import { escape as SQLEscape } from 'sqlstring'
import { checkPermissions, canRead, canWrite } from '../../shared/permissions'

const env = process.env.NODE_ENV || 'development'
const types = [ 'wiki', 'group', 'person', 'place', 'art', 'story' ]

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
    this.permissions = page.permissions.toString()
    this.owner = page.owner
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
   * Returns an array of the valid page types.
   * @returns {string[]} - An array of strings, each one providing the name of
   *   a valid page type.
   */

  static getTypes () {
    return types
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
   *   properties include `path` (for the page's path), `type` (for the type of
   *   the page), `title` (for the page's title), and `body` (for the wikitext
   *   of the page's main content).
   * @param editor {Member} - The member creating the page. This object must at
   *   least include an `id` property specifying the editor's member ID.
   * @param msg {string} - A commit message.
   * @param db {Pool} - A database connection.
   * @param es {function} - An Elasticsearch client.
   * @returns {Promise} - A promise that resolves with the newly created Page
   *   instance once it has been added to the database.
   */

  static async create (data, editor, msg, db, es) {
    // Figure out values
    const slug = data.slug ? data.slug : slugify(data.title)
    const parent = data.parent ? await Page.get(data.parent, db) : null
    const pid = parent ? parent.id : 0
    const path = await Page.getPath(data, parent, db)
    const title = data.title ? data.title : ''
    const type = data.type && types.indexOf(data.type) > -1 ? data.type : 'wiki'
    const permissions = data.permissions ? data.permissions : 744

    // Add to database
    const res = await db.run(`INSERT INTO pages (slug, path, parent, title, type, permissions, owner) VALUES ('${slug}', '${path}', ${pid}, '${title}', '${type}', ${permissions}, ${editor.id});`)
    const id = res.insertId
    await db.run(`INSERT INTO changes (page, editor, timestamp, msg, json) VALUES (${id}, ${editor.id}, ${Math.floor(Date.now() / 1000)}, ${SQLEscape(msg)}, ${SQLEscape(JSON.stringify(data))});`)

    // Add to elasticsearch index
    const indexData = JSON.parse(JSON.stringify(data))
    delete indexData.path
    try {
      await es.index({
        index: `${type}_${env}`,
        type: '_doc',
        id,
        body: Object.assign({}, indexData, {
          slug,
          permissions,
          sitePath: path,
          owner: editor.id
        })
      })
    } catch (err) {
      console.error(err.body.error)
    }

    // Return the page
    return Page.get(id, db)
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
        // We found a page, so get its changes and send the whole thing back
        const changes = await db.run(`SELECT c.id AS id, c.timestamp AS timestamp, c.msg AS msg, c.json AS json, m.name AS editorName, m.email AS editorEmail, m.id AS editorID FROM changes c, members m WHERE c.editor=m.id AND c.page=${pages[0].id} ORDER BY c.timestamp DESC;`)
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
   *   properties include `path` (for the page's path), `type` (for the type of
   *   the page), `title` (for the page's title), and `body` (for the wikitext
   *   of the page's main content).
   * @param editor {Member} - The member creating the page.
   * @param msg {string} - A commit message.
   * @param db {Pool} - A database connection.
   * @param es {function} - An Elasticsearch client.
   * @returns {Promise} - A promise that resolves once the page has been
   *   updated.
   */

  async update (data, editor, msg, db, es) {
    // What updates do we need to make to the page itself?
    const inPage = ['title', 'slug', 'path', 'parent', 'permissions', 'owner']
    const update = {}
    for (const key of inPage) {
      if (data[key] && this[key] !== data[key]) {
        if (key === 'parent') {
          const parent = await Page.get(data.parent)
          const pid = parent && parent.id ? parent.id : 0
          update.parent = pid
          this.parent = pid
        } else {
          update[key] = data[key]
          this[key] = key === 'permissions' ? data.permissions.toString() : data[key]
        }
      }
    }

    // Update the pages table in the database
    const fields = [
      { name: 'title', type: 'string' },
      { name: 'slug', type: 'string' },
      { name: 'path', type: 'string' },
      { name: 'parent', type: 'number' },
      { name: 'permissions', type: 'number' },
      { name: 'owner', type: 'number' }
    ]
    const vals = updateVals(fields, update)
    if (vals !== '') await db.run(`UPDATE pages SET ${vals} WHERE id=${this.id};`)

    // Track changes
    const timestamp = Math.floor(Date.now() / 1000)
    const res = await db.run(`INSERT INTO changes (page, editor, timestamp, msg, json) VALUES (${this.id}, ${editor.id}, ${timestamp}, ${SQLEscape(msg)}, ${SQLEscape(JSON.stringify(data))});`)

    // Update the elasticsearch index
    await es.index({
      index: `${this.type}_${env}`,
      type: '_doc',
      id: this.id,
      body: {
        doc: Object.assign({}, data, {
          slug: this.slug,
          path: this.path
        })
      }
    })

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
  }

  /**
   * Rollback a page to a previous version.
   * @param id {int} - The ID of the version to roll back to.
   * @param editor {Member} - The Member instance of the person rolling back
   *   the page.
   * @param db {Pool} - A database connection.
   * @param es {function} - An Elasticsearch client.
   * @returns {Promise} - A promise that resolves when the page has been rolled
   *   back.
   */

  async rollbackTo (id, editor, db, es) {
    const target = this.changes.filter(r => r.id === id)
    if (target.length === 1) {
      const msg = `Rollback to change #${id}`
      await this.update(target[0].content, editor, msg, db, es)
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
}

export default Page
