const request = require('supertest')
const app = require('../config/app')
const env = require('../config/envfile')
const MongooseHelper = require('../../infra/helpers/mongoose-helper')
const OrderModel = require('../../infra/entities/OrderModel')
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

describe('Index Order Routes', () => {
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
    await OrderModel.deleteMany()
  })

  afterAll(async () => {
    await UserModel.deleteMany()
    await MongooseHelper.disconnect()
  })

  test('Should require authorization', async () => {
    await request(app).get('/api/index-order').expect(401)
  })

  test('Should return 200 and orders if no errors', async () => {
    const orders = await OrderModel.find({})
    expect(orders.length).toBe(0)

    const fakeOrder = new OrderModel({
      user_id: '63d6a6f028b2aec497a3146c',
      products: [
        {
          product_id: '63d6a6f028b2aec497a3146c',
          quantity: 1
        }
      ]
    })
    await fakeOrder.save()
    const fakeOrderTwo = new OrderModel({
      user_id: '62d6a6f028b2aec497a3146c',
      products: [
        {
          product_id: '62d6a6f028b2aec497a3146c',
          quantity: 2
        }
      ]
    })
    await fakeOrderTwo.save()

    const response = await request(app)
      .get('/api/index-order')
      .auth(accessToken, { type: 'bearer' })
    expect(response.status).toBe(200)

    expect(response.body.length).toBe(2)
    expect(JSON.stringify(response.body[0]._id)).toEqual(
      JSON.stringify(fakeOrder._id)
    )
    expect(JSON.stringify(response.body[1]._id)).toEqual(
      JSON.stringify(fakeOrderTwo._id)
    )
  })
})
