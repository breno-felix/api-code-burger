const MongooseHelper = require('../helpers/mongoose-helper')
const env = require('../../main/config/envfile')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const productSchema = MongooseHelper.newSchema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category_id: {
      type: MongooseHelper.getObjectId(),
      ref: 'Category',
      required: true
    },
    imagePath: { type: String, required: true }
  },
  {
    timestamps: true
  },
  {
    virtuals: {
      urlPath: {
        get() {
          return `${env.appUrl}/product-file/${this.imagePath}`
        }
      }
    }
  }
)

productSchema.pre('remove', function () {
  return promisify(fs.unlink)(
    path.resolve(__dirname, '..', '..', '..', 'uploads', this.imagePath)
  )
})

module.exports = MongooseHelper.newModel('Product', productSchema)
