const MongooseHelper = require('../helpers/mongoose-helper')
const env = require('../../main/config/envfile')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const { S3 } = require('@aws-sdk/client-s3')

const productSchema = MongooseHelper.newSchema({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category_id: {
    type: MongooseHelper.getObjectId(),
    ref: 'Category',
    required: true
  },
  imagePath: { type: String, required: true },
  offer: { type: Boolean, default: false }
})

productSchema.virtual('urlPath').get(function () {
  if (process.env.NODE_ENV === 'production') {
    return `${env.storageURL}/${this.imagePath}`
  }
  return `${env.appUrl}/file/${this.imagePath}`
})

productSchema.set('toJSON', { virtuals: true })
productSchema.set('id', false)
productSchema.set('timestamps', true)

productSchema.pre('remove', async function () {
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

module.exports = MongooseHelper.newModel('Product', productSchema)
