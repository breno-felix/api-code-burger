const MongooseHelper = require('../helpers/mongoose-helper')
const env = require('../../main/config/envfile')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const aws = require('aws-sdk')

const s3 = new aws.S3()

const categorySchema = MongooseHelper.newSchema({
  name: { type: String, required: true, unique: true },
  imagePath: { type: String, required: true }
})

categorySchema.virtual('urlPath').get(function () {
  if (process.env.NODE_ENV === 'production') {
    return `${env.storageURL}/${this.imagePath}`
  }
  return `${env.appUrl}/file/${this.imagePath}`
})

categorySchema.set('toJSON', { virtuals: true })
categorySchema.set('id', false)
categorySchema.set('timestamps', true)

categorySchema.pre('remove', function () {
  if (env.storageTypes === 's3') {
    return s3
      .deleteObject({
        Bucket: 'codeburger',
        Key: this.imagePath
      })
      .promise()
  }
  return promisify(fs.unlink)(
    path.resolve(__dirname, '..', '..', '..', 'uploads', this.imagePath)
  )
})

module.exports = MongooseHelper.newModel('Category', categorySchema)
