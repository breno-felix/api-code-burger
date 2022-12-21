const path = require('path')
const dotenv = require('dotenv')

dotenv.config({
  path: path.join(
    __dirname,
    '..',
    '..',
    '..',
    process.env.NODE_ENV === 'test' ? '.env.testing' : '.env'
  )
})

module.exports = {
  // production
  dbUrl: process.env.DB_URL,
  port: process.env.PORT,
  // test
  urlMongooseTest: process.env.MONGODB_DSN
}
