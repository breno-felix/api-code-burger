import MongooseHelper from '../infra/helpers/mongoose-helper'
import env from './config/envfile'
import app from './config/app'

console.log('Wait connecting to the database')

MongooseHelper.connect(env.dbUrl)
  .then(() => {
    console.log('MongoDB Atlas Connected')
    app.listen(env.port, () => console.log(`server running at ${env.appUrl}`))
  })
  .catch(console.error)
