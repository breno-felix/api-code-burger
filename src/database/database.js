import mongoose from 'mongoose'
import env from '../envfile'

const connectMongoDB = () => {
  console.log('Wait connecting to the database')

  mongoose
    .connect(env.dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Atlas Connected'))
    .catch((error) => console.log(error))
}

export default connectMongoDB
