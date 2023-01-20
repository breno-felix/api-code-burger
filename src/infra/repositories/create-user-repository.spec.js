const CreateUserRepository = require('./create-user-repository')
const MongooseHelper = require('../helpers/mongoose-helper')
const env = require('../../main/config/envfile')
const UserModel = require('../entities/UserModel')
const { MissingParamServerError } = require('../../utils/errors')

const makeSut = () => {
  return new CreateUserRepository(UserModel)
}

describe('CreateUser Repository', () => {
  beforeAll(async () => {
    await MongooseHelper.connect(env.urlMongooseTest)
  })

  beforeEach(async () => {
    await UserModel.deleteMany()
  })

  afterAll(async () => {
    await MongooseHelper.disconnect()
  })

  test('Should create user with the given object', async () => {
    const sut = makeSut()

    const validUser = {
      name: 'valid_name',
      email: 'valid_email@mail.com',
      password: 'valid_password',
      admin: false
    }
    await sut.create(validUser)
    const user = await UserModel.findOne({
      email: validUser.email
    })
    expect({
      name: user.name,
      email: user.email,
      password: user.password,
      admin: user.admin
    }).toEqual(validUser)
    expect(user._id).toEqual(expect.anything())
  })

  test('Should create user with the admin param false by default', async () => {
    const sut = makeSut()

    const validUser = {
      name: 'valid_name',
      email: 'valid_email@mail.com',
      password: 'valid_password'
    }
    await sut.create(validUser)
    const user = await UserModel.findOne({
      email: validUser.email
    })
    expect(user.admin).toBe(false)
  })

  test('Should throw if no userModel is provided', async () => {
    const sut = new CreateUserRepository()
    const validUser = {
      name: 'valid_name',
      email: 'valid_email@mail.com',
      password: 'valid_password',
      admin: false
    }
    const promise = sut.create(validUser)
    expect(promise).rejects.toThrow()
  })

  test('Should throw if no userObject is provided', async () => {
    const sut = makeSut()
    expect(sut.create()).rejects.toThrow(
      new MissingParamServerError('userObject')
    )
  })
})
