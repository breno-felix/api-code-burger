const path = require('path')
const dotenv = require('dotenv')

dotenv.config({
  path: path.join(
    __dirname,
    '..',
    '..',
    '..',
    process.env.NODE_ENV === 'test'
      ? '.env.test.local'
      : process.env.NODE_ENV === 'production'
      ? '.env'
      : '.env.dev'
  )
})

module.exports = {
  // production
  dbUrl: process.env.DB_URL,
  secret: process.env.TOKEN_SECRET,
  saltRounds: process.env.SALT_ROUNDS,
  expiresIn: process.env.TOKEN_EXPIRESIN,
  appUrl: process.env.APP_URL,
  // test
  port: process.env.PORT,
  urlMongooseTest: process.env.MONGODB_DSN
}
