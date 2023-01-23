const request = require('supertest')
const app = require('../config/app')
const MongooseHelper = require('../../infra/helpers/mongoose-helper')
const env = require('../config/envfile')
const ProductModel = require('../../infra/entities/ProductModel')
const CategoryModel = require('../../infra/entities/CategoryModel')
const path = require('path')
const MissingParamError = require('../../utils/errors/missing-param-error')

describe('New Product Routes', () => {
  beforeAll(async () => {
    await MongooseHelper.connect(env.urlMongooseTest)
  })

  beforeEach(async () => {
    await ProductModel.deleteMany()
    await CategoryModel.deleteMany()
  })

  afterAll(async () => {
    await MongooseHelper.disconnect()
  })

  test('Should return 201 when valid data are provided', async () => {
    let products = await ProductModel.find({})
    expect(products.length).toBe(0)

    const fakeCategory = new CategoryModel({
      name: 'valid_name'
    })
    await fakeCategory.save()
    const productTest = {
      name: 'valid_name',
      price: 10.01,
      category_id: fakeCategory._id.toString()
    }
    const response = await request(app)
      .post('/api/new-product')
      .field('name', productTest.name)
      .field('price', productTest.price)
      .field('category_id', productTest.category_id)
      .attach(
        'file',
        path.resolve(
          __dirname,
          '..',
          '..',
          '..',
          'test-upload',
          'image_to_test.png'
        )
      )
    expect(response.status).toBe(201)

    products = await ProductModel.find({})
    expect(products.length).toBe(1)
    expect(products[0]._id).toEqual(expect.anything())
    expect(products[0].name).toBe(productTest.name)
    expect(products[0].price).toBe(productTest.price)
    expect(products[0].category_id.toString()).toBe(productTest.category_id)
    expect(products[0].imagePath).toEqual(expect.anything())
    await products[0].remove()
  })

  test('Should return 400 if no name is provided', async () => {
    const fakeCategory = new CategoryModel({
      name: 'valid_name'
    })
    await fakeCategory.save()
    const productTest = {
      price: 10.01,
      category_id: fakeCategory._id.toString()
    }

    const response = await request(app)
      .post('/api/new-product')
      .field('price', productTest.price)
      .field('category_id', productTest.category_id)
      .attach(
        'file',
        path.resolve(
          __dirname,
          '..',
          '..',
          '..',
          'test-upload',
          'image_to_test.png'
        )
      )
    expect(response.status).toBe(400)
    expect(response.body.error).toBe(new MissingParamError('name').message)
  })
})
