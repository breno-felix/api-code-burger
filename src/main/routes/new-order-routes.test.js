const request = require('supertest')
const app = require('../config/app')
const env = require('../config/envfile')
const MongooseHelper = require('../../infra/helpers/mongoose-helper')
const OrderModel = require('../../infra/entities/OrderModel')
const UserModel = require('../../infra/entities/UserModel')
const ProductModel = require('../../infra/entities/ProductModel')
const CategoryModel = require('../../infra/entities/CategoryModel')
const bcrypt = require('bcrypt')
let accessToken
let fakeUserId

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
    fakeUserId = fakeUser._id
  })

  afterEach(async () => {
    await OrderModel.deleteMany()
    await CategoryModel.deleteMany()
    await ProductModel.deleteMany()
  })

  afterAll(async () => {
    await UserModel.deleteMany()
    await MongooseHelper.disconnect()
  })

  test('Should return 201 when valid data are provided', async () => {
    let orders = await OrderModel.find({})
    expect(orders.length).toBe(0)

    const fakeCategory = new CategoryModel({
      name: 'valid_name'
    })
    await fakeCategory.save()
    const fakeProduct = new ProductModel({
      name: 'valid_name',
      price: 10.01,
      category_id: fakeCategory._id.toString(),
      imagePath: 'valid_name'
    })
    await fakeProduct.save()
    const orderTest = {
      products: [
        {
          product_id: fakeProduct._id.toString(),
          quantity: 1
        }
      ]
    }

    const response = await request(app)
      .post('/api/new-order')
      .auth(accessToken, { type: 'bearer' })
      .send(orderTest)
    expect(response.status).toBe(201)

    orders = await OrderModel.find({})
    expect(orders.length).toBe(1)
    expect(orders[0]._id).toEqual(expect.anything())
    expect(orders[0].products.product_id).toBe(orderTest.products.product_id)
    expect(orders[0].products.quantity).toBe(orderTest.products.quantity)
    expect(orders[0].user_id).toStrictEqual(fakeUserId)
    expect(orders[0].status).toBe('Pedido realizado')
  })
})
