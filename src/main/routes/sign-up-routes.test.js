const request = require('supertest')
const app = require('../config/app')
const MongooseHelper = require('../../infra/helpers/mongoose-helper')
const env = require('../config/envfile')
const UserModel = require('../../infra/entities/UserModel')

const requiredParams = ['name', 'email', 'password', 'repeatPassword']

describe('Sign Up Routes', () => {
  beforeAll(async () => {
    await MongooseHelper.connect(env.urlMongooseTest)
  })

  beforeEach(async () => {
    await UserModel.deleteMany()
  })

  afterAll(async () => {
    await MongooseHelper.disconnect()
  })

  test('Should return 201 when valid data are provided', async () => {
    let users = await UserModel.find({})
    expect(users.length).toBe(0)

    const userTest = {
      name: 'valid_name',
      email: 'valid_email@mail.com',
      password: 'valid_password',
      repeatPassword: 'valid_password'
    }
    const response = await request(app).post('/api/sign-up').send(userTest)
    expect(response.status).toBe(201)

    users = await UserModel.find({})
    expect(users.length).toBe(1)
    expect(users[0]._id).toEqual(expect.anything())
    expect(users[0].admin).toBe(false)
    expect(users[0].email).toBe(userTest.email)
    expect(users[0].name).toBe(userTest.name)
    expect(users[0].password).toEqual(expect.anything())
    expect(users[0].password).not.toBe(userTest.password)
  })

  requiredParams.forEach((param) => {
    test(`Should return 400 if no ${param} is provided`, async () => {
      const userTest = {
        name: 'valid_name',
        email: 'valid_email@mail.com',
        password: 'valid_password',
        repeatPassword: 'valid_password'
      }
      delete userTest[param]
      const response = await request(app).post('/api/sign-up').send(userTest)
      expect(response.status).toBe(400)
    })
  })
})
