const MongooseHelper = require('../helpers/mongoose-helper')
const env = require('../../main/config/envfile')
const UserModel = require('../entities/UserModel')
const LoadUserByEmailRepository = require('./load-user-by-email-repository')
const { MissingParamServerError } = require('../../utils/errors')

const makeSut = () => {
  return new LoadUserByEmailRepository(UserModel)
}

describe('LoadUserByEmail Repository', () => {
  beforeAll(async () => {
    await MongooseHelper.connect(env.urlMongooseTest)
  })

  beforeEach(async () => {
    await UserModel.deleteMany()
  })

  afterAll(async () => {
    await MongooseHelper.disconnect()
  })

  test('Should return null if no user is found', async () => {
    const sut = makeSut()
    const user = await sut.load('invalid_email@mail.com')
    expect(user).toBeNull()
  })

  test('Should return an user if user is found', async () => {
    const sut = makeSut()
    const fakeUser = new UserModel({
      email: 'valid_email@mail.com',
      password: 'hashed_password'
    })
    await fakeUser.save()
    const user = await sut.load('valid_email@mail.com')
    expect(user._id).toEqual(fakeUser._id)
  })

  test('Should throw if no UserModel if provided', async () => {
    const sut = new LoadUserByEmailRepository()
    const promise = sut.load('any_email@mail.com')
    expect(promise).rejects.toThrow()
  })

  test('Should throw if no email if provided', async () => {
    const sut = makeSut()
    const promise = sut.load()
    expect(promise).rejects.toThrow(new MissingParamServerError('email'))
  })
})
