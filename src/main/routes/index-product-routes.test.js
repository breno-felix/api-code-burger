const request = require('supertest')
const app = require('../config/app')
const env = require('../config/envfile')
const MongooseHelper = require('../../infra/helpers/mongoose-helper')
const ProductModel = require('../../infra/entities/ProductModel')
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

describe('New Category Routes', () => {
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
    await ProductModel.deleteMany()
  })

  afterAll(async () => {
    await UserModel.deleteMany()
    await MongooseHelper.disconnect()
  })

  test('Should require authorization', async () => {
    await request(app).get('/api/index-product').expect(401)
  })

  test('Should return 200 and products if no errors', async () => {
    const products = await ProductModel.find({})
    expect(products.length).toBe(0)

    const fakeProduct = new ProductModel({
      name: 'any_name',
      price: 10.01,
      category_id: '62d6a6f028b2aec497a3146c',
      imagePath: 'any_name'
    })
    await fakeProduct.save()
    const fakeProductTwo = new ProductModel({
      name: 'some_name',
      price: 10.02,
      category_id: '62d6a6f028b2aec497a3146c',
      imagePath: 'some_name'
    })
    await fakeProductTwo.save()

    const response = await request(app)
      .get('/api/index-product')
      .auth(accessToken, { type: 'bearer' })
    expect(response.status).toBe(200)

    expect(response.body.length).toBe(2)
    expect(JSON.stringify(response.body[0]._id)).toEqual(
      JSON.stringify(fakeProduct._id)
    )
    expect(JSON.stringify(response.body[1]._id)).toEqual(
      JSON.stringify(fakeProductTwo._id)
    )
  })
})
