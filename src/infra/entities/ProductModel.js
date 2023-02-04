const MongooseHelper = require('../helpers/mongoose-helper')
const env = require('../../main/config/envfile')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const aws = require('aws-sdk')

const s3 = new aws.S3()

const productSchema = MongooseHelper.newSchema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category_id: {
      type: MongooseHelper.getObjectId(),
      ref: 'Category',
      required: true
    },
    imagePath: { type: String, required: true },
    offer: { type: Boolean, default: false }
  },
  {
    timestamps: true
  },
  {
    virtuals: {
      urlPath: {
        get() {
          if (process.env.NODE_ENV === 'production') {
            return `${env.storageURL}/${this.imagePath}`
          }
          return `${env.appUrl}/file/${this.imagePath}`
        }
      }
    }
  }
)

productSchema.pre('remove', function () {
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

module.exports = MongooseHelper.newModel('Product', productSchema)
