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
    const stamp = new Date()
    const y = stamp.getFullYear()
    const m = `${stamp.getMonth() + 1}`.padStart(2, '0')
    const name = `uploads/${y}/${m}/${file.name}`

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
