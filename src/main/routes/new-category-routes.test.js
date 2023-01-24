const request = require('supertest')
const app = require('../config/app')
const MongooseHelper = require('../../infra/helpers/mongoose-helper')
const env = require('../config/envfile')
const CategoryModel = require('../../infra/entities/CategoryModel')
const UserModel = require('../../infra/entities/UserModel')
const bcrypt = require('bcrypt')
let accessToken

const loginUser = async (email, password) => {
  const response = await request(app)
    .post('/api/login')
    .send({ email, password })
  expect(response.status).toBe(200)

  return response.body.accessToken
}

describe('New Category Routes', () => {
  beforeAll(async () => {
    await MongooseHelper.connect(env.urlMongooseTest)
    await UserModel.deleteMany()
    const fakeUser = new UserModel({
      name: 'valid_name',
      email: 'valid_email@mail.com',
      password: bcrypt.hashSync('hashed_password', 10)
    })
    await fakeUser.save()
    accessToken = await loginUser('valid_email@mail.com', 'hashed_password')
  })

  beforeEach(async () => {
    await CategoryModel.deleteMany()
  })

  afterAll(async () => {
    await UserModel.deleteMany()
    await MongooseHelper.disconnect()
  })

  const requiredParams = ['name']

  test('Should require authorization', async () => {
    await request(app).post('/api/new-category').expect(401)
  })

  test('Should return 201 when valid data are provided', async () => {
    let categories = await CategoryModel.find({})
    expect(categories.length).toBe(0)

    const categoryTest = {
      name: 'valid_name'
    }

    const response = await request(app)
      .post('/api/new-category')
      .auth(accessToken, { type: 'bearer' })
      .send(categoryTest)
    expect(response.status).toBe(201)

    categories = await CategoryModel.find({})
    expect(categories.length).toBe(1)
    expect(categories[0]._id).toEqual(expect.anything())
    expect(categories[0].name).toBe(categoryTest.name)
  })

  requiredParams.forEach((param) => {
    test(`Should return 400 if no ${param} is provided`, async () => {
      const categoryTest = {
        name: 'valid_name'
      }
      delete categoryTest[param]
      const response = await request(app)
        .post('/api/new-category')
        .auth(accessToken, { type: 'bearer' })
        .send(categoryTest)
      expect(response.status).toBe(400)
    })
  })

  test('Should return 400 when name is not unique', async () => {
    const category = {
      name: 'any_name'
    }
    await request(app)
      .post('/api/new-category')
      .auth(accessToken, { type: 'bearer' })
      .send(category)
      .expect(201)

    const categoryTest = {
      name: 'any_name'
    }
    const response = await request(app)
      .post('/api/new-category')
      .auth(accessToken, { type: 'bearer' })
      .send(categoryTest)
    expect(response.status).toBe(400)
  })
})
