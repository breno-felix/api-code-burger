const MongooseHelper = require('../helpers/mongoose-helper')

const productSchema = MongooseHelper.newSchema({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category_id: {
    type: MongooseHelper.getObjectId(),
    ref: 'Category',
    required: true
  },
  imagePath: { type: String, required: true }
})

module.exports = MongooseHelper.newModel('Product', productSchema)
