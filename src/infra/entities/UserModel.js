const MongooseHelper = require('../helpers/mongoose-helper')

const userSchema = MongooseHelper.newSchema({
  email: String,
  password: String,
  accessToken: String
})

module.exports = MongooseHelper.newModel('user', userSchema)
