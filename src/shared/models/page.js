import slugify from '../slugify'
import plainParse from '../../server/parse/plain'
import { parseTags, parseLocation, parseType } from '../../server/parse/tags'
import { updateVals, SQLEscape } from '../../server/utils'
import { checkPermissions, canRead, canWrite } from '../permissions'
import { isPopulatedArray } from '../utils'

/**
 * This model handles dealing with pages in the database.
 */

class Page {
  constructor (page, changes) {
    this.id = page.id
    this.title = page.title
    this.description = page.description
    this.image = page.image
    this.header = page.header === 'null' ? null : page.header
    this.slug = page.slug
    this.path = page.path
    this.parent = page.parent
    this.type = page.type
    this.permissions = page.permissions.toString()
    this.owner = page.owner
    this.depth = page.depth
    this.file = page.file
    this.lat = page.lat
    this.lon = page.lon
    this.likes = page.likes
    this.changes = []
    this.tags = {}

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

    Object.keys(page.tags).forEach(key => { this.tags[key] = page.tags[key] })
  }

  /**
   * Returns `true` if the path given matches the pattern for any of the
   * reserved paths (paths that are used internally, and so cannot be used for
   * any member-created pages). Returns `false` if the path does not match any
   * of those patterns (meaning it's safe to use).
   * @param path {string} - The path to check.
   * @returns {boolean} - A boolean indicating if the path matches a reserved
   *   pattern (`true`), or if it is safe to use (`false`).
   */

  static isReservedPath (path) {
    let reserved = false
    const reservedPaths = [
      /^\/login(\/(.*))?$/g,
      /^\/login-route(\/(.*))?$/g,
      /^\/logout(\/(.*))?$/g,
      /^\/connect(\/(.*))?$/g,
      /^\/disconnect(\/(.*))?$/g,
      /^\/member(\/(.*))?$/g,
      /^\/welcome(\/(.*))?$/g,
      /^\/invite(\/(.*))?$/g,
      /^\/join(\/(.*))?$/g,
      /^\/forgot-passphrase(\/(.*))?$/g,
      /^\/dashboard(\/(.*))?$/g,
      /^\/new(\/(.*))?$/g,
      /^\/upload(\/(.*))?$/g,
      /^\/autocomplete(\/(.*))?$/g,
      /^\/like(\/(.*))?$/g,
      /^\/unlike(\/(.*))?$/g,
      /^\/explore(\/(.*))?$/g
    ]

    for (let pattern of reservedPaths) {
      if (path.match(pattern)) reserved = true
    }
    return reserved
  }

  /**
   * If passed the type and title to be used when saving a page, this method
   * returns `false` if the page is not a template or if it is a template with
   * a valid name (one that is not the name of an internal template). It will
   * return `true` if the type argument is equal to the string `'Template'` and
   * the title argument is one of the reserved, internal template names
   * (meaning that the page is not valid).
   * @param type {string} - The type of the page.
   * @param title {string} - The title of the page.
   * @returns {boolean} - `true` if the given arguments indicate that the page
   *   will conflict with reserved, internal templates, or `false` if not.
   */

  static isReservedTemplate (type, title) {
    const reservedTemplates = [
      'Template',
      'Children',
      'Gallery',
      'Artists',
      'Art',
      'Download'
    ]
    return (type === 'Template' && reservedTemplates.indexOf(title) > -1)
  }

  /**
   * Derives a suitable description from body text.
   * @param body {string} - Body text for a page.
   * @returns {string} - Suitable body text for the page given.
   */

  static async getDescription (body) {
    // Google truncates descriptions to ~155-160 characters, so we want to make
    // a description that uses all the complete sentences that will fit into
    // that space.
    const cutoff = 150
    const txt = await plainParse(body)
    if (!txt || txt.length === 0) {
      // Things have gone wrong in a completely unexpected way. Return our
      // default description.
      return 'Four hundred years from now, humanity thrives beyond civilization.'
    } else if (txt.length < cutoff) {
      return txt
    } else {
      const sentences = txt.match(/[^\.!\?]+[\.!\?]+/g)
      let desc = sentences[0]
      let i = 1
      let ready = false
      if (desc.length < cutoff) {
        // The first sentence is not as long as the cutoff. How many sentences
        // can we add before we reach that limit?
        while (!ready) {
          const candidate = sentences.length > i ? `${desc.trim()} ${sentences[i].trim()}` : null
          if (!candidate || (candidate.length > cutoff) || (i === sentences.length - 1)) {
            ready = true
          } else {
            desc = candidate
            i++
          }
        }
      } else {
        // The first sentence is already beyond the cutoff, so let's truncate
        // it at the cutoff.
        const words = desc.split(' ')
        desc = words[0]
        while (!ready) {
          const candidate = words.length > i ? `${desc.trim()} ${words[i].trim()}` : null
          if (!candidate || (candidate.length > cutoff - 1) || (i === words.length - 1)) {
            ready = true
          } else {
            desc = candidate
            i++
          }
        }
        desc = `${desc}…`
      }
      return desc
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
   * Returns latest changes for page's parent.
   * @param page {Object} - An object representation of a page.
   * @returns {Object|undefined} - Latest changes for page's parent, or
   *   undefined if it doesn't have any.
   */

  static getParent (page) {
    return isPopulatedArray(page.lineage) && isPopulatedArray(page.lineage[0].changes)
      ? page.lineage[0].changes[0] && page.lineage[0].changes[0].content
        ? page.lineage[0].changes[0].content
        : undefined
      : undefined
  }

  /**
   * Saves the page's place record to the database.
   * @param coords {Object} - An object containing a `lat` property, containing
   *   the latitude as a float, and a `lon` property, containing the longitude
   *   as a float.
   * @param id {number} - The page ID.
   * @param db {Pool} - The database connection.
   * @returns {Promise<void>} - A Promise that resolves when the place record
   *   has been updated (if it already existed) or inserted.
   */

  static async setPlace (coords, id, db) {
    if (coords && coords.lat && coords.lon) {
      const { lat, lon } = coords
      const check = await db.run(`SELECT COUNT(id) AS count FROM places WHERE page = ${id};`)
      const geom = `ST_GeomFromText('POINT(${lat} ${lon})', 4326)`
      const sql = check && check[0] && check[0].count > 0
        ? `UPDATE places SET location=${geom} WHERE page=${id};`
        : `INSERT INTO places (page, location) VALUES (${id}, ${geom});`
      await db.run(sql)
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
    const description = data.description ? data.description : await Page.getDescription(data.body)
    const image = data.image
    const header = data.header ? data.header : null
    const permissions = data.permissions ? data.permissions : 774
    const depth = parent ? parent.depth + 1 : 0
    const type = data.type ? data.type : parseType(data.body)
    const coords = parseLocation(data.body)

    // Add to database
    if (Page.isReservedPath(path)) {
      throw new Error(`${path} is a reserved path.`)
    } else if (Page.isReservedTemplate(type, title)) {
      throw new Error(`{{${title}}} is used internally. You cannot create a template with that name.`)
    } else {
      try {
        const res = await db.run(`INSERT INTO pages (slug, path, parent, type, title, description, image, header, permissions, owner, depth) VALUES (${SQLEscape(slug)}, ${SQLEscape(path)}, ${pid}, ${SQLEscape(type)}, ${SQLEscape(title)}, ${SQLEscape(description)}, ${SQLEscape(image)}, ${SQLEscape(header)}, ${permissions}, ${editor.id}, ${depth});`)
        const id = res.insertId
        await db.run(`INSERT INTO changes (page, editor, timestamp, msg, json) VALUES (${id}, ${editor.id}, ${Math.floor(Date.now() / 1000)}, ${SQLEscape(msg)}, ${SQLEscape(JSON.stringify(data))});`)
        if (coords) await Page.setPlace(coords, id, db)
        await Page.createTags(id, data.body, db)
        return Page.get(id, db)
      } catch (err) {
        throw err
      }
    }
  }

  /**
   * Delete all tags associated with the given page ID from the database. This
   * is used each time the page is updated because it's possible to have
   * multiple values for the same tag, so if we didn't clear the tags each time
   * we save the page we might end up with a separate copy of the tag record
   * for each time that the page was saved.
   * @param id {number} - The page ID.
   * @param db {Pool} - The database connection.
   * @returns {Promise<void>} - A Promise that resolves when all of the tags
   *   for the specified page ID have been deleted from the database.
   */

  static async clearTags (id, db) {
    await db.run(`DELETE FROM tags WHERE page=${id};`)
  }

  /**
   * Creates a single tag record.
   * @param id {number} - The ID of the page in the database.
   * @param tag {string} - The name of the tag.
   * @param val {string} - The value of the tag.
   * @param db {Pool} - The database connection.
   * @returns {Promise<void>} - A Promise that resolves when the tag has been
   *   created in the database.
   */

  static async createTag (id, tag, val, db) {
    const sqlTag = SQLEscape(tag)
    const sqlVal = SQLEscape(val)
    const check = await db.run(`SELECT COUNT(id) AS count FROM tags WHERE page=${id} AND tag=${sqlTag} AND value=${sqlVal};`)
    if (check && check[0] && check[0].count <= 0) await db.run(`INSERT INTO tags (page, tag, value) VALUES (${id}, ${sqlTag}, ${sqlVal});`)
  }

  /**
   * Creates tags in the database for all of the tags specified in the given
   * wikitext.
   * @param id {number} - The ID of the page in the database.
   * @param body {string} - The current wikitext of the page.
   * @param db {Pool} - The database connection.
   * @returns {Promise<void>} - A Promise that resolves when all tag records
   *   have been created in the database.
   */

  static async createTags (id, body, db) {
    await Page.clearTags(id, db)
    const tags = parseTags(body)
    const doNotSave = [ 'Type', 'Location' ]
    for (let key in tags) {
      if (doNotSave.indexOf(key) < 0) {
        const val = tags[key]
        if (Array.isArray(val)) {
          for (let v of val) {
            await Page.createTag(id, key, v, db)
          }
        } else {
          await Page.createTag(id, key, val, db)
        }
      }
    }
  }

  /**
   * Fetches all tag records associated with a page ID from the database.
   * @param id {number} - The page ID.
   * @param db {Pool} - The database connection.
   * @returns {Promise<object>} - A Promise that resolves with an object, with
   *   each property set to one of the name/value pairs (tags) retrieved from
   *   the database for the page.
   */

  static async getTags (id, db) {
    const tags = {}
    const records = await db.run(`SELECT tag, value FROM tags WHERE page=${id};`)
    if (records && records.length > 0) {
      records.forEach(record => {
        tags[record.tag] = record.value
      })
    }
    return tags
  }

  /**
   * Returns an object with the latitude and longitude of the first place found
   * in the database associated with the given page ID.
   * @param id {number} - The page ID.
   * @param db {Pool} - The database connection.
   * @returns {Promise<Object|null>} - A Promise that resolves with an object
   *   containing the latitude and longitude of the place, or `null` if no
   *   place could be found.
   */

  static async getPlace (id, db) {
    const record = await db.run(`SELECT ST_X(location) AS lat, ST_Y(location) AS lon FROM places WHERE page=${id};`)
    return record && Array.isArray(record) && record.length > 0
      ? record[0]
      : null
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
      const column = (typeof id === 'string') ? 'path' : 'id'
      const pages = await db.run(`SELECT * FROM pages WHERE ${column}=${SQLEscape(id)};`)
      const page = Array.isArray(pages) && pages.length === 1 ? pages[0] : false
      if (page) {
        // We found a page, so get its changes...
        const changes = await db.run(`SELECT c.id AS id, c.timestamp AS timestamp, c.msg AS msg, c.json AS json, m.name AS editorName, m.email AS editorEmail, m.id AS editorID FROM changes c, members m WHERE c.editor=m.id AND c.page=${page.id} ORDER BY c.timestamp DESC;`)
        changes.reverse()
        // Fetch its tags...
        page.tags = await Page.getTags(page.id, db)
        // And its location...
        const coords = await Page.getPlace(page.id, db)
        if (coords) Object.assign(page, coords)
        // And see if it has any files...
        const files = await db.run(`SELECT * FROM files WHERE page=${page.id} ORDER BY timestamp DESC;`)
        if (files) page.file = files[0]
        // And find out who likes it...
        const likes = await db.run(`SELECT member FROM likes WHERE page=${page.id};`)
        if (likes) page.likes = likes.map(like => like.member)
        return new Page(page, changes)
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
    const inPage = [ 'title', 'description', 'image', 'header', 'slug', 'path', 'parent', 'permissions', 'owner', 'type' ]
    const nullEmptyStr = [ 'title', 'header', 'type' ]
    const update = {}
    for (const key of inPage) {
      if (data.hasOwnProperty(key) && this[key] !== data[key]) {
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
          if (nullEmptyStr.includes(key) && data[key] === '') {
            update[key] = null
          } else {
            update[key] = data[key]
          }
        }
      }
    }

    if (data.body) {
      const location = parseLocation(data.body)
      if (location) update.location = location

      const type = data.type ? data.type : parseType(data.body)
      if (type && this.type !== type) update.type = type
    }

    // Check to make sure we're not trying to use a reserved path or template
    const newPath = update.path ? update.path : this.path
    const newType = update.type ? update.type : this.type
    const newTitle = update.title ? update.title : this.title

    if (Page.isReservedPath(newPath)) {
      throw new Error(`${newPath} is a reserved path.`)
    } else if (Page.isReservedTemplate(newType, newTitle)) {
      throw new Error(`{{${newTitle}}} is used internally. You cannot create a template with that name.`)
    } else {
      // Update this object
      Object.keys(update).forEach(key => {
        this[key] = update[key]
      })

      // Update the pages table in the database
      const fields = [
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'image', type: 'string' },
        { name: 'header', type: 'string' },
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

        // Update tags
        await Page.createTags(this.id, data.body, db)

        // If it's a place, update that
        if (update.location) {
          await Page.setPlace(update.location, this.id, db)
          this.lat = update.location.lat
          this.lon = update.location.lon
        }
      } catch (err) {
        throw err
      }
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
   *   be returned. (Default: `null`)
   * @param limit {Number} - An integer to limit the number of responses to.
   *   (Default: `null`)
   * @param order {string} - If provided the string `'oldest'`, returns pages
   *   in order from oldest to newest (chronological order, as determined by
   *   ID). If provided the string `'newest'`, returns pages in order from
   *   newest to oldest (reverse chronological order, as determined by ID).
   *   If provided the string `'alphabetical'`, returns the pages in
   *   alphabetical order by title. (Default: `'alphabetical'`)
   * @returns {Promise<*>} - A promise that resolves with an array of all of
   *   the page's direct child pages.
   */

  async getChildren (db, type = null, limit = null, order = 'alphabetical') {
    const base = `SELECT p.title, p.path, f.thumbnail FROM pages p LEFT JOIN files f ON f.page = p.id WHERE p.parent=${this.id}`
    const typeQuery = type ? ` AND p.type='${type}'` : ''
    const limitQuery = limit ? ` LIMIT ${limit}` : ''

    let orderQuery = ''
    switch (order) {
      case 'oldest': orderQuery = ' ORDER BY p.id ASC'; break
      case 'newest': orderQuery = ' ORDER BY p.id DESC'; break
      default: orderQuery = ' ORDER BY p.title ASC'; break
    }

    return db.run(`${base}${typeQuery}${orderQuery}${limitQuery};`)
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

  /**
   * Records a "like" for a page.
   * @param id {number} - The ID of the member liking the page.
   * @param db {Pool} - A database connection.
   * @returns {Promise<void>} - A Promise that resolves when the like has been
   *   recorded to the database.
   */

  async like (id, db) {
    const check1 = this.likes.indexOf(id) < 0 && !isNaN(id)
    if (check1) {
      const check2 = await db.run(`SELECT id FROM likes WHERE page = ${this.id} AND member = ${id};`)
      if (check2.length === 0) {
        await db.run(`INSERT INTO likes (path, page, member) VALUES (${SQLEscape(this.path)}, ${this.id}, ${id});`)
        this.likes.push(id)
      }
    }
  }

  /**
   * Removes a member's "like" from a page.
   * @param id {nnumber} - The ID of the member removing her like.
   * @param db {Pool} - A database connection.
   * @returns {Promise<void>} - A Promise that is resolved when the record of
   *   the member's "like" has been removed.
   */

  async unlike (id, db) {
    if (!isNaN(id)) {
      await db.run(`DELETE FROM likes WHERE page = ${this.id} AND member = ${id};`)
      this.likes = this.likes.filter(member => member !== id)
    }
  }
}

export default Page
