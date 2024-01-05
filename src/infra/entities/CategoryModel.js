const MongooseHelper = require('../helpers/mongoose-helper')
const env = require('../../main/config/envfile')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const { S3 } = require('@aws-sdk/client-s3')

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

categorySchema.pre('remove', async function () {
  if (env.storageTypes === 's3') {
    try {
      const s3 = new S3({
        region: env.awsDefaultRegion,
        credentials: {
          accessKeyId: env.awsAccessKeyId,
          secretAccessKey: env.awsSecretAccessKey
        }
      })

      await s3.deleteObject({
        Bucket: env.awsBucketName,
        Key: this.imagePath
      })
    } catch (error) {
      console.error('Erro ao excluir objeto do S3:', error)
      throw error
    }
  } else {
    try {
      await promisify(fs.unlink)(
        path.resolve(__dirname, '..', '..', '..', 'uploads', this.imagePath)
      )
    } catch (error) {
      console.error('Erro ao excluir arquivo local:', error)
      throw error
    }
  }
})

module.exports = MongooseHelper.newModel('Category', categorySchema)
