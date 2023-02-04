const request = require('supertest')
const app = require('../config/app')
const env = require('../config/envfile')
const MongooseHelper = require('../../infra/helpers/mongoose-helper')
const ProductModel = require('../../infra/entities/ProductModel')
const CategoryModel = require('../../infra/entities/CategoryModel')
const UserModel = require('../../infra/entities/UserModel')
const path = require('path')
const bcrypt = require('bcrypt')
let accessToken

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
  })

  afterEach(async () => {
    await ProductModel.deleteMany()
    await CategoryModel.deleteMany()
  })

  afterAll(async () => {
    await UserModel.deleteMany()
    await MongooseHelper.disconnect()
  })

  test('Should require authorization', async () => {
    await request(app).put('/api/update-product/any_id').expect(401)
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
      .put('/api/update-product/any_id')
      .auth(accessTokenTwo, { type: 'bearer' })
      .expect(403)
  })

  test('Should return 204 when valid data are provided', async () => {
    let products = await ProductModel.find({})
    expect(products.length).toBe(0)

    const fakeCategory = new CategoryModel({
      name: 'valid_name',
      imagePath: 'any_name'
    })
    await fakeCategory.save()
    const fakeProduct = new ProductModel({
      name: 'valid_name',
      price: 10.01,
      category_id: fakeCategory._id.toString(),
      imagePath: 'any_name'
    })
    await fakeProduct.save()

    const otherFakeCategory = new CategoryModel({
      name: 'other_valid_name',
      imagePath: 'any_name'
    })
    await otherFakeCategory.save()

    const productObjectToUpdate = {
      name: 'other_name',
      price: 10.05,
      offer: true,
      category_id: otherFakeCategory._id.toString()
    }

    const response = await request(app)
      .put(`/api/update-product/${fakeProduct._id}`)
      .auth(accessToken, { type: 'bearer' })
      .field('name', productObjectToUpdate.name)
      .field('price', productObjectToUpdate.price)
      .field('offer', productObjectToUpdate.offer)
      .field('category_id', productObjectToUpdate.category_id)
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
    expect(response.status).toBe(204)

    products = await ProductModel.find({})
    expect(products.length).toBe(1)
    expect(products[0].offer).toBe(productObjectToUpdate.offer)
    expect(products[0].name).toBe(productObjectToUpdate.name)
    expect(products[0].price).toBe(productObjectToUpdate.price)
    expect(products[0].category_id.toString()).toBe(
      productObjectToUpdate.category_id
    )
    expect(products[0].imagePath).not.toBe(fakeProduct.imagePath)

    await products[0].remove()
  })

  test('Should return 400 if invalid price is provided', async () => {
    const fakeCategory = new CategoryModel({
      name: 'valid_name',
      imagePath: 'any_name'
    })
    await fakeCategory.save()
    const fakeProduct = new ProductModel({
      name: 'valid_name',
      price: 10.01,
      category_id: fakeCategory._id.toString(),
      imagePath: 'any_name'
    })
    await fakeProduct.save()

    const otherFakeCategory = new CategoryModel({
      name: 'other_valid_name',
      imagePath: 'any_name'
    })
    await otherFakeCategory.save()

    const productObjectToUpdate = {
      name: 'other_name',
      price: 'invalid_price',
      offer: true,
      category_id: otherFakeCategory._id.toString()
    }

    const response = await request(app)
      .put(`/api/update-product/${fakeProduct._id}`)
      .auth(accessToken, { type: 'bearer' })
      .field('name', productObjectToUpdate.name)
      .field('price', productObjectToUpdate.price)
      .field('offer', productObjectToUpdate.offer)
      .field('category_id', productObjectToUpdate.category_id)
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
  })

  test('Should return 400 if invalid category_id is provided', async () => {
    const fakeCategory = new CategoryModel({
      name: 'valid_name',
      imagePath: 'any_name'
    })
    await fakeCategory.save()
    const fakeProduct = new ProductModel({
      name: 'valid_name',
      price: 10.01,
      category_id: fakeCategory._id.toString(),
      imagePath: 'any_name'
    })
    await fakeProduct.save()

    const otherFakeCategory = new CategoryModel({
      name: 'other_valid_name',
      imagePath: 'any_name'
    })
    await otherFakeCategory.save()

    const productObjectToUpdate = {
      name: 'other_name',
      price: 10.01,
      offer: true,
      category_id: 'invalid_category_id'
    }

    const response = await request(app)
      .put(`/api/update-product/${fakeProduct._id}`)
      .auth(accessToken, { type: 'bearer' })
      .field('name', productObjectToUpdate.name)
      .field('price', productObjectToUpdate.price)
      .field('offer', productObjectToUpdate.offer)
      .field('category_id', productObjectToUpdate.category_id)
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
  })

  test('Should return 400 when category_id do not exist', async () => {
    const fakeCategory = new CategoryModel({
      name: 'valid_name',
      imagePath: 'any_name'
    })
    await fakeCategory.save()
    const fakeProduct = new ProductModel({
      name: 'valid_name',
      price: 10.01,
      category_id: fakeCategory._id.toString(),
      imagePath: 'any_name'
    })
    await fakeProduct.save()

    const productObjectToUpdate = {
      name: 'other_name',
      price: 10.01,
      offer: true,
      category_id: '63d3b8f958d39d25d6edcd78'
    }

    const response = await request(app)
      .put(`/api/update-product/${fakeProduct._id}`)
      .auth(accessToken, { type: 'bearer' })
      .field('name', productObjectToUpdate.name)
      .field('price', productObjectToUpdate.price)
      .field('offer', productObjectToUpdate.offer)
      .field('category_id', productObjectToUpdate.category_id)
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
  })
})
