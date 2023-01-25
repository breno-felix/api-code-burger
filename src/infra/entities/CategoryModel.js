const MongooseHelper = require('../helpers/mongoose-helper')

const categorySchema = MongooseHelper.newSchema(
  {
    name: { type: String, required: true, unique: true }
  },
  {
    timestamps: true
  }
)

module.exports = MongooseHelper.newModel('Category', categorySchema)
