import aws from 'aws-sdk'
import config from '../../../config'

/**
 * Set up AWS S3 connection.
 */

aws.config.update({
  accessKeyId: config.aws.key,
  secretAccessKey: config.aws.secret,
  region: config.aws.region
})
const bucket = new aws.S3({ params: { Bucket: config.aws.bucket } })

/**
 * This model handles dealing with files in the database and uploading them to
 * Amazon S3.
 */

class File {
  constructor (row) {
    this.id = row.id
    this.name = row.name
    this.mime = row.mime
    this.size = row.size
    this.page = row.page
    this.timestamp = row.timestamp
    this.uploader = row.uploader
  }

  /**
   * Returns a file's record from the database.
   * @param id {string|number} - If given a number, returns the file record
   *   with that ID number. If given a string, returns the file record with
   *   that name.
   * @param db {Pool} - A database connection.
   * @returns {Promise<*>} - A promise that resolves with the matching file
   *   record or null if none could be found.
   */

  static async get (id, db) {
    const q = isNaN(id)
      ? `SELECT * FROM files WHERE name='${id}';`
      : `SELECT * FROM files WHERE id=${id};`
    const res = await db.run(q)
    if (res.length > 0) {
      return new File(res[0])
    } else {
      return null
    }
  }

  /**
   * Create a new file record in the database.
   * @param file {Object} - An object that defines the data for a new file
   *   record. Expects properties `name` (string; the path of the file on
   *   AWS S3), `mime` (string; the MIME type of the file), and `size`
   *   (int; the size of the file in bytes).
   * @param page {Page} - The file's page.
   * @param member {Member} - The member who uploaded the file.
   * @param db {Pool} - A database connection.
   * @returns {Promise<*>} - A promise that resolves with a new File object
   *   once the record has been added to the database.
   */

  static async create (file, page, member, db) {
    const timestamp = Math.floor(Date.now() / 1000)
    const r = await db.run(`INSERT INTO files (name, mime, size, page, timestamp, uploader) VALUES ('${file.name}', '${file.mime}', ${file.size}, ${page.id}, ${timestamp}, ${member.id});`)
    return File.get(r.insertId, db)
  }

  /**
   * Uploads a file to Amazon AWS S3 and adds a record to the database.
   * @param file {Object} - An object providing the file to be uploaded.
   *   Expects properties `name` (string; the file name of the file being
   *   uploaded), `mimetype` (string; the MIME type of the file), `data` (the
   *   actual file to be uploaded), and `size` (integer; the size of the file
   *   in bytes).
   * @param page {Page} - The file's page.
   * @param member {Member} - The member uploading the file.
   * @param db {Pool} - A database connection.
   * @returns {Promise<*>} - A promise that resolves with a new File object
   *   once the file has been uploaded and added to the database.
   */

  static async upload (file, page, member, db) {
    return new Promise((resolve, reject) => {
      const parts = file.name.split('.')
      const nameParts = parts.slice(0, parts.length - 1)
      const ext = parts[parts.length - 1]
      const stamp = new Date()
      const yr = stamp.getFullYear()
      const mo = `${stamp.getMonth() + 1}`.padStart(2, '0')
      const da = `${stamp.getDate()}`.padStart(2, '0')
      const hr = `${stamp.getHours()}`.padStart(2, '0')
      const mn = `${stamp.getMinutes()}`.padStart(2, '0')
      const sc = `${stamp.getSeconds()}`.padStart(2, '0')
      const name = `uploads/${nameParts.join('.')}.${yr}${mo}${da}.${hr}${mn}${sc}.${ext}`

      bucket.upload({
        Key: name,
        ContentType: file.mimetype,
        Body: file.data,
        ACL: 'public-read'
      }, (err, data) => {
        if (err) {
          reject(err)
        } else {
          File.create({
            name: data.key,
            mime: file.mimetype,
            size: file.size
          }, page, member, db)
            .then(data => {
              resolve(data)
            })
            .catch(err => {
              reject(err)
            })
        }
      })
    })
  }

  /**
   * Delete a file.
   * @param name {string} - The file's name. This is the string used both in
   *   AWS S3 and in the database's `name` column.
   * @param db {Pool} - A database connection.
   * @returns {Promise<boolean>} - A promise that resolves once the file has
   *   been deleted from both AWS S3 and the database.
   */

  static async delete (name, db) {
    try {
      const res1 = await bucket.deleteObject({ Key: name }).promise()
      const res2 = await db.run(`DELETE FROM files WHERE name='${name}';`)
      return res2.affectedRows > 0 && Object.keys(res1).length === 0
    } catch (err) {
      console.error(err)
      return false
    }
  }

  /**
   * Deletes all of a page's previous files, and then uploads the given file.
   * @param file {Object} - An object providing the file to be uploaded.
   *   Expects properties `name` (string; the file name of the file being
   *   uploaded), `mimetype` (string; the MIME type of the file), `data` (the
   *   actual file to be uploaded), and `size` (integer; the size of the file
   *   in bytes).
   * @param page {Page} - The file's page.
   * @param member {Member} - The member uploading the file.
   * @param db {Pool} - A database connection.
   * @returns {Promise<*>} - A promise that resolves with a new File object
   *   once all files previously associated with the page have been deleted and
   *   the new file has been uploaded to AWS S3 and added to the database.
   */

  static async update (file, page, member, db) {
    const old = await db.run(`SELECT name FROM files WHERE page=${page.id};`)
    for (let i = 0; i < old.length; i++) {
      await File.delete(old[i].name, db)
    }
    return File.upload(file, page, member, db)
  }
}

export default File
