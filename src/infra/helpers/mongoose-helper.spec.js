const env = require('../../main/envfile')
const MongooseHelper = require('./mongoose-helper')

const userSchema = MongooseHelper.newSchema({
  email: String,
  password: String
})

const UserModel = MongooseHelper.newModel('user', userSchema)

describe('Mongoose Helper', () => {
  afterEach(async () => {
    await UserModel.deleteMany()
    await MongooseHelper.disconnect()
  })

  test('Should return a connection to MongoDB with mongoose', async () => {
    const promise = MongooseHelper.connect(env.urlMongooseTest)
    await expect(promise).resolves.toBeInstanceOf(
      MongooseHelper.getTypeOfMongoose()
    )
  })

  test('Should create a new document in MongoDB with mongoose', async () => {
    await MongooseHelper.connect(env.urlMongooseTest)
    const fakeUser = new UserModel({
      email: 'any_email@mail.com',
      password: 'hashed_password'
    })
    await fakeUser.save()
    expect(fakeUser._id).toBeInstanceOf(MongooseHelper.getTypeOfObjectId())
  })

  test('Should return a document if document is found in mongodb with mongoose', async () => {
    await MongooseHelper.connect(env.urlMongooseTest)
    const fakeUser = new UserModel({
      email: 'any_email@mail.com',
      password: 'hashed_password'
    })
    await fakeUser.save()
    const users = await UserModel.find()
    expect(users[0].email).toBe('any_email@mail.com')
    expect(users.length).toBeGreaterThan(0)
  })
})
