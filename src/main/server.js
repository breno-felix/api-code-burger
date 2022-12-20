import mongoose from 'mongoose'
import env from './envfile'
import app from './app'

mongoose.set('strictQuery', true)

console.log('Wait connecting to the database')

mongoose
  .connect(env.dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB Atlas Connected')
    app.listen(env.port, () =>
      console.log(`server running on port ${env.port}`)
    )
  })
  .catch((error) => console.log(error))
