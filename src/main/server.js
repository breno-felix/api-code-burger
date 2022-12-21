import MongooseHelper from '../infra/helpers/mongoose-helper'
import env from './envfile'
import app from './app'

console.log('Wait connecting to the database')

MongooseHelper.connect(env.dbUrl)
  .then(() => {
    console.log('MongoDB Atlas Connected')
    app.listen(env.port, () =>
      console.log(`server running on port ${env.port}`)
    )
  })
  .catch(console.error)
