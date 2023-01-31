const request = require('supertest')
const app = require('../config/app')
const env = require('../config/envfile')
const MongooseHelper = require('../../infra/helpers/mongoose-helper')
const CategoryModel = require('../../infra/entities/CategoryModel')
const UserModel = require('../../infra/entities/UserModel')
const bcrypt = require('bcrypt')
let accessToken

const accessloginRouter = async (email, password) => {
  const response = await request(app)
    .post('/api/login')
    .send({ email, password })
  expect(response.status).toBe(200)

  return response.body.accessToken
}

describe('Index Category Routes', () => {
  beforeAll(async () => {
    await MongooseHelper.connect(env.urlMongooseTest)
    const fakeUser = new UserModel({
      name: 'valid_name',
      email: 'valid_email@mail.com',
      password: bcrypt.hashSync('hashed_password', 10)
    })
    await fakeUser.save()
    accessToken = await accessloginRouter(fakeUser.email, 'hashed_password')
  })

  afterEach(async () => {
    await CategoryModel.deleteMany()
  })

  afterAll(async () => {
    await UserModel.deleteMany()
    await MongooseHelper.disconnect()
  })

  test('Should require authorization', async () => {
    await request(app).get('/api/index-category').expect(401)
  })

  test('Should return 200 and categories if no errors', async () => {
    const categories = await CategoryModel.find({})
    expect(categories.length).toBe(0)

    const fakeCategory = new CategoryModel({
      name: 'any_name'
    })
    await fakeCategory.save()
    const fakeCategoryTwo = new CategoryModel({
      name: 'some_name'
    })
    await fakeCategoryTwo.save()

    const response = await request(app)
      .get('/api/index-category')
      .auth(accessToken, { type: 'bearer' })
    expect(response.status).toBe(200)

    expect(response.body.length).toBe(2)
    expect(JSON.stringify(response.body[0]._id)).toEqual(
      JSON.stringify(fakeCategory._id)
    )
    expect(JSON.stringify(response.body[1]._id)).toEqual(
      JSON.stringify(fakeCategoryTwo._id)
    )
  })
})
