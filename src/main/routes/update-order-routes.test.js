const request = require('supertest')
const app = require('../config/app')
const env = require('../config/envfile')
const MongooseHelper = require('../../infra/helpers/mongoose-helper')
const OrderModel = require('../../infra/entities/OrderModel')
const ProductModel = require('../../infra/entities/ProductModel')
const CategoryModel = require('../../infra/entities/CategoryModel')
const UserModel = require('../../infra/entities/UserModel')
const bcrypt = require('bcrypt')
let accessToken
let userId

const accessloginRouter = async (email, password) => {
  const response = await request(app)
    .post('/api/login')
    .send({ email, password })
  expect(response.status).toBe(200)

  return response.body.accessToken
}

describe('Update Product Routes', () => {
  beforeAll(async () => {
    await MongooseHelper.connect(env.urlMongooseTest)
    const fakeUser = new UserModel({
      name: 'valid_name',
      email: 'valid_email@mail.com',
      password: bcrypt.hashSync('hashed_password', 10),
      admin: true
    })
    await fakeUser.save()
    accessToken = await accessloginRouter(fakeUser.email, 'hashed_password')
    userId = fakeUser._id
  })

  afterEach(async () => {
    await ProductModel.deleteMany()
    await CategoryModel.deleteMany()
    await OrderModel.deleteMany()
  })

  afterAll(async () => {
    await UserModel.deleteMany()
    await MongooseHelper.disconnect()
  })

  test('Should require authorization', async () => {
    await request(app).patch('/api/update-order/any_id').expect(401)
  })

  test('Should require User Admin authorization', async () => {
    const fakeUserNoAdmin = new UserModel({
      name: 'valid_name_two',
      email: 'valid_email_two@mail.com',
      password: bcrypt.hashSync('hashed_password', 10)
    })
    await fakeUserNoAdmin.save()
    const accessTokenTwo = await accessloginRouter(
      fakeUserNoAdmin.email,
      'hashed_password'
    )
    await request(app)
      .patch('/api/update-order/any_id')
      .auth(accessTokenTwo, { type: 'bearer' })
      .expect(403)
  })

  test('Should return 204 when valid data are provided', async () => {
    let orders = await OrderModel.find({})
    expect(orders.length).toBe(0)

    const fakeCategory = new CategoryModel({
      name: 'valid_name',
      imagePath: 'any_name'
    })
    await fakeCategory.save()

    const fakeProduct = new ProductModel({
      name: 'valid_name',
      price: 10.01,
      category_id: fakeCategory._id,
      imagePath: 'valid_image_path'
    })
    await fakeProduct.save()

    const fakeProductTwo = new ProductModel({
      name: 'valid_name',
      price: 10.01,
      category_id: fakeCategory._id,
      imagePath: 'valid_image_path'
    })
    await fakeProductTwo.save()

    const fakeOrder = new OrderModel({
      user_id: userId,
      products: [
        {
          product_id: fakeProduct._id,
          quantity: 1
        },
        {
          product_id: fakeProductTwo._id,
          quantity: 2
        }
      ]
    })
    await fakeOrder.save()

    const orderObjectToUpdate = {
      status: 'other_name',
      order_id: fakeOrder._id
    }

    const response = await request(app)
      .patch(`/api/update-order/${orderObjectToUpdate.order_id}`)
      .auth(accessToken, { type: 'bearer' })
      .send({
        status: orderObjectToUpdate.status
      })
    expect(response.status).toBe(204)

    orders = await OrderModel.find({})
    expect(orders.length).toBe(1)
    expect(orders[0].status).toBe(orderObjectToUpdate.status)
  })

  test('Should return 400 when order_id do not exist', async () => {
    const orderObjectToUpdate = {
      status: 'other_name'
    }

    const response = await request(app)
      .patch('/api/update-order/63dc069983ed126ff042986a')
      .auth(accessToken, { type: 'bearer' })
      .send({
        status: orderObjectToUpdate.status
      })
    expect(response.status).toBe(400)
  })

  test('Should return 400 if status do not provided', async () => {
    const orders = await OrderModel.find({})
    expect(orders.length).toBe(0)

    const fakeCategory = new CategoryModel({
      name: 'valid_name',
      imagePath: 'any_name'
    })
    await fakeCategory.save()

    const fakeProduct = new ProductModel({
      name: 'valid_name',
      price: 10.01,
      category_id: fakeCategory._id,
      imagePath: 'valid_image_path'
    })
    await fakeProduct.save()

    const fakeProductTwo = new ProductModel({
      name: 'valid_name',
      price: 10.01,
      category_id: fakeCategory._id,
      imagePath: 'valid_image_path'
    })
    await fakeProductTwo.save()

    const fakeOrder = new OrderModel({
      user_id: userId,
      products: [
        {
          product_id: fakeProduct._id,
          quantity: 1
        },
        {
          product_id: fakeProductTwo._id,
          quantity: 2
        }
      ]
    })
    await fakeOrder.save()

    const orderObjectToUpdate = {
      order_id: fakeOrder._id
    }

    const response = await request(app)
      .patch(`/api/update-order/${orderObjectToUpdate.order_id}`)
      .auth(accessToken, { type: 'bearer' })
    expect(response.status).toBe(400)
  })
})
