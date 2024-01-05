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
  storageTypes: process.env.STORAGE_TYPES,
  storageURL: process.env.STORAGE_URL,
  awsDefaultRegion: process.env.AWS_DEFAULT_REGION,
  awsBucketName: process.env.AWS_BUCKET_NAME,
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  // test
  port: process.env.PORT,
  urlMongooseTest: process.env.MONGODB_DSN
}
