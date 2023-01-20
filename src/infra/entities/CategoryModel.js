const MongooseHelper = require('../helpers/mongoose-helper')

const categorySchema = MongooseHelper.newSchema({
  name: String
})

module.exports = MongooseHelper.newModel('category', categorySchema)
