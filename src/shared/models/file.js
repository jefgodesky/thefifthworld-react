import aws from 'aws-sdk'
import sharp from 'sharp'
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
    const thumbnail = file.thumbnail ? file.thumbnail : ''
    const r = await db.run(`INSERT INTO files (name, thumbnail, mime, size, page, timestamp, uploader) VALUES ('${file.name}', '${thumbnail}', '${file.mime}', ${file.size}, ${page.id}, ${timestamp}, ${member.id});`)
    return File.get(r.insertId, db)
  }

  /**
   * Uploads a file to AWS S3.
   * @param name {string} - The name to use for the file.
   * @param data {Blob} - The file data to upload.
   * @param mime {string} - The MIME type of the file.
   * @returns {Promise<void>} - A promise that resolves when the file has been
   *   uploaded to AWS S3.
   */

  static async uploadFile (name, data, mime) {
    return new Promise((resolve, reject) => {
      bucket.upload({
        Key: name,
        ContentType: mime,
        Body: data,
        ACL: 'public-read'
      }, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

  /**
   * If a thumbnail is provided, this method uploads it. If not, and the file
   * is an image, one is generated, and then uploaded with the name and MIME
   * type provided. If neither of these are true, the promise simply resolves
   * with a value of `null`.
   * @param thumbnail {File} - A thumbnail to upload.
   * @param name {string} - The name to use for the thumbnail.
   * @param data {Blob} - The data for an image file to create a thumbnail for.
   * @param mime {string} - The MIME type of the thumbnail.
   * @returns {Promise<void>} - A promise that resolves once the thumbnail has
   *   been uploaded, if there is a thumbnail to upload.
   */

  static async uploadThumb (thumbnail, name, data, mime) {
    return new Promise((resolve, reject) => {
      const imageTypes = [ 'image/gif', 'image/jpeg', 'image/png' ]
      if (thumbnail) {
        File.uploadFile(name, thumbnail.data, 'image/jpeg')
          .then(data => {
            resolve(data)
          })
          .catch(err => {
            reject(err)
          })
      } else if (imageTypes.indexOf(mime) > -1) {
        sharp(data)
          .resize(256, 256)
          .toBuffer()
          .then(thumb => {
            resolve(thumb)
          })
          .catch(err => { reject(err) })
      } else {
        resolve(null)
      }
    })
  }

  /**
   * Uploads a file to Amazon AWS S3 and adds a record to the database.
   * @param file {Object} - An object providing the file to be uploaded.
   *   Expects properties `name` (string; the file name of the file being
   *   uploaded), `mimetype` (string; the MIME type of the file), `data` (the
   *   actual file to be uploaded), and `size` (integer; the size of the file
   *   in bytes).
   * @param thumbnail {Blob} - The blob for a thumbnail to use for the file.
   * @param page {Page} - The file's page.
   * @param member {Member} - The member uploading the file.
   * @param db {Pool} - A database connection.
   * @returns {Promise<*>} - A promise that resolves with a new File object
   *   once the file has been uploaded and added to the database.
   */

  static async upload (file, thumbnail, page, member, db) {
    const exts = {
      'image/gif': 'gif',
      'image/jpeg': 'jpg',
      'image/png': 'png'
    }
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
    const thumbMime = thumbnail ? 'image/jpeg' : file.mimetype
    const thumbExt = exts[thumbMime] ? exts[thumbMime] : ext
    const name = `uploads/${nameParts.join('.')}.${yr}${mo}${da}.${hr}${mn}${sc}.${ext}`
    const thumbName = `uploads/${nameParts.join('.')}.${yr}${mo}${da}.${hr}${mn}${sc}.256x256.${thumbExt}`

    try {
      await File.uploadFile(name, file.data, file.mimetype)
      await File.uploadThumb(thumbnail, thumbName, file.data, thumbMime)
      return File.create({
        name,
        thumbnail: thumbName,
        mime: file.mimetype,
        size: file.size
      }, page, member, db)
    } catch (err) {
      console.error(err)
    }
  }

  /**
   * Delete a file.
   * @param record {Object} - An object that must include a `name` property
   *   specifying the file's name. This is the string used both in AWS S3 and
   *   in the database's `name` column. It may also include a `thumbnail`
   *   property, which is the string used to identify the thumbnail in AWS S3
   *   and is listed in the database's `thumbnail` column.
   * @param db {Pool} - A database connection.
   * @returns {Promise<boolean>} - A promise that resolves once the file has
   *   been deleted from both AWS S3 and the database.
   */

  static async delete (record, db) {
    try {
      const res1 = await bucket.deleteObject({ Key: record.name }).promise()
      const res2 = (record.thumbnail && record.thumbnail !== '')
        ? await bucket.deleteObject({ Key: record.thumbnail }).promise()
        : {}
      const res3 = await db.run(`DELETE FROM files WHERE name='${record.name}';`)
      return res3.affectedRows > 0 && Object.keys(res1).length === 0 && Object.keys(res2).length === 0
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
   * @param thumbnail {Blob} - The blob for the thumbnail to use.
   * @param page {Page} - The file's page.
   * @param member {Member} - The member uploading the file.
   * @param db {Pool} - A database connection.
   * @returns {Promise<*>} - A promise that resolves with a new File object
   *   once all files previously associated with the page have been deleted and
   *   the new file has been uploaded to AWS S3 and added to the database.
   */

  static async update (file, thumbnail, page, member, db) {
    const old = await db.run(`SELECT name, thumbnail FROM files WHERE page=${page.id};`)
    for (let i = 0; i < old.length; i++) {
      await File.delete(old[i], db)
    }
    return File.upload(file, thumbnail, page, member, db)
  }
}

export default File
