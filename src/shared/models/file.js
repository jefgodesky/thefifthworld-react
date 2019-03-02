import aws from 'aws-sdk'
import config from '../../../config'

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
  constructor(row) {
    this.id = row.id
    this.name = row.name
    this.mime = row.mime
    this.size = row.size
    this.page = row.page
    this.timestamp = row.timestamp
    this.uploader = row.uploader
  }

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

  static async create (file, page, member, db) {
    const timestamp = Math.floor(Date.now() / 1000)
    const r = await db.run(`INSERT INTO files (name, mime, size, page, timestamp, uploader) VALUES ('${file.name}', '${file.mime}', ${file.size}, ${page.id}, ${timestamp}, ${member.id});`)
    return File.get(r.insertId, db)
  }

  static async upload(file, page, member, db) {
    return new Promise((resolve, reject) => {
      const parts = file.name.split('.')
      const nameParts = parts.slice(0, parts.length - 1)
      const ext = parts[parts.length - 1]
      const stamp = new Date()
      const yr = stamp.getFullYear()
      const mo = `${stamp.getMonth() + 1}`.padStart(2, '0')
      const da = `${stamp.getDay()}`.padStart(2, '0')
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
}

export default File
