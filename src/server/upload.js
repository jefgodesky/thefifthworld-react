import aws from 'aws-sdk'
import config from '../../config'

aws.config.update({
  accessKeyId: config.aws.key,
  secretAccessKey: config.aws.secret,
  region: config.aws.region
})

const bucket = new aws.S3({ params: { Bucket: config.aws.bucket } })

const upload = file => {
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
        resolve(data)
      }
    })
  })
}

export default upload
