const MongooseHelper = require('../helpers/mongoose-helper')
const env = require('../../main/envfile')
const MissingParamError = require('../../utils/errors/missing-param-error')
const UpdateAccessTokenRepository = require('./update-access-token-repository')

const userSchema = MongooseHelper.newSchema({
  email: String,
  password: String,
  accessToken: String
})

const UserModel = MongooseHelper.newModel('user', userSchema)

const makeSut = () => {
  return new UpdateAccessTokenRepository(UserModel)
}

describe('UpdateAccessToken Repository', () => {
  let fakeUserId
  beforeAll(async () => {
    await MongooseHelper.connect(env.urlMongooseTest)
  })

  beforeEach(async () => {
    await UserModel.deleteMany()
    const fakeUser = new UserModel({
      email: 'valid_email@mail.com',
      password: 'hashed_password'
    })
    await fakeUser.save()
    fakeUserId = fakeUser._id
  })

  afterAll(async () => {
    await MongooseHelper.disconnect()
  })

  test('Should update the user with the given accessToken', async () => {
    const sut = makeSut()
    await sut.update(fakeUserId, 'valid_token')
    const updatedFakeUser = await UserModel.findOne({
      _id: fakeUserId
    })
    expect(updatedFakeUser.accessToken).toBe('valid_token')
  })

  test('Should throw if no userModel if provided', async () => {
    const sut = new UpdateAccessTokenRepository()
    const promise = sut.update(fakeUserId, 'valid_token')
    expect(promise).rejects.toThrow()
  })

  test('Should throw if no params are provided', async () => {
    const sut = makeSut()
    expect(sut.update()).rejects.toThrow(new MissingParamError('userId'))
    expect(sut.update(fakeUserId)).rejects.toThrow(
      new MissingParamError('accessToken')
    )
  })
})
