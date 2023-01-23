const MongooseHelper = require('../helpers/mongoose-helper')

const userSchema = MongooseHelper.newSchema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  admin: { type: Boolean, default: false },
  accessToken: String
})

module.exports = MongooseHelper.newModel('User', userSchema)
