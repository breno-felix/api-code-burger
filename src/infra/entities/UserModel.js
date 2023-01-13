const MongooseHelper = require('../helpers/mongoose-helper')

const userSchema = MongooseHelper.newSchema({
  name: String,
  email: String,
  password: String,
  admin: Boolean,
  accessToken: String
})

module.exports = MongooseHelper.newModel('user', userSchema)
