const mongoose = require('mongoose')

mongoose.set('strictQuery', true)

module.exports = {
  async connect(uri) {
    const client = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    return client
  },

  async disconnect() {
    await mongoose.connection.close()
  },

  newSchema(objeto) {
    const newSchema = new mongoose.Schema(objeto)
    return newSchema
  },

  newModel(dbName, schema) {
    const newModel = mongoose.model(dbName, schema)
    return newModel
  },

  getTypeOfMongoose() {
    return mongoose.Mongoose
  },

  getTypeOfObjectId() {
    return mongoose.Types.ObjectId
  },

  getObjectId() {
    return mongoose.ObjectId
  }
}
