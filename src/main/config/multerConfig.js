const multer = require('multer')
const path = require('path')
const { S3 } = require('@aws-sdk/client-s3')
const multerS3 = require('multer-s3')
const env = require('./envfile')

const s3 = new S3({
  region: env.awsDefaultRegion,
  credentials: {
    accessKeyId: env.awsAccessKeyId,
    secretAccessKey: env.awsSecretAccessKey
  }
})

const storageTypes = {
  local: multer.diskStorage({
    destination: (request, file, callback) => {
      callback(null, path.resolve(__dirname, '..', '..', '..', 'uploads'))
    },
    filename: (request, file, callback) => {
      const time = new Date().getTime()

      file.key = `${time}_${file.originalname}`

      callback(null, file.key)
    }
  }),
  s3: multerS3({
    s3,
    bucket: env.awsBucketName,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    key: (request, file, callback) => {
      const time = new Date().getTime()

      callback(null, `${time}_${file.originalname}`)
    }
  })
}

module.exports = {
  storage: storageTypes[env.storageTypes],
  limits: {
    fileSize: 2 * 1024 * 1024
  },
  fileFilter: (request, file, callback) => {
    const allowedMimes = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/gif']
    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true)
    } else {
      callback(new Error('Invalid file type.'))
    }
  }
}
