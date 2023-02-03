const request = require('supertest')
const app = require('../config/app')
const env = require('../config/envfile')
const MongooseHelper = require('../../infra/helpers/mongoose-helper')
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

describe('Update Category Routes', () => {
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
    await CategoryModel.deleteMany()
  })

  afterAll(async () => {
    await UserModel.deleteMany()
    await MongooseHelper.disconnect()
  })

  test('Should require authorization', async () => {
    await request(app).put('/api/update-category/any_id').expect(401)
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
      .put('/api/update-category/any_id')
      .auth(accessTokenTwo, { type: 'bearer' })
      .expect(403)
  })

  test('Should return 204 when valid data are provided', async () => {
    let categories = await CategoryModel.find({})
    expect(categories.length).toBe(0)

    const fakeCategory = new CategoryModel({
      name: 'valid_name',
      imagePath: 'any_name'
    })
    await fakeCategory.save()

    const categoryObjectToUpdate = {
      name: 'other_valid_name'
    }

    const response = await request(app)
      .put(`/api/update-category/${fakeCategory._id}`)
      .auth(accessToken, { type: 'bearer' })
      .field('name', categoryObjectToUpdate.name)
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

    categories = await CategoryModel.find({})
    expect(categories.length).toBe(1)
    expect(categories[0].name).toBe(categoryObjectToUpdate.name)
    expect(categories[0].imagePath).not.toBe(fakeCategory.imagePath)
    await categories[0].remove()
  })

  test('Should return 400 when name is not unique', async () => {
    const categories = await CategoryModel.find({})
    expect(categories.length).toBe(0)

    const fakeCategory = new CategoryModel({
      name: 'valid_name',
      imagePath: 'any_name'
    })
    await fakeCategory.save()

    const categoryObjectToUpdate = {
      name: 'valid_name'
    }

    const response = await request(app)
      .put(`/api/update-category/${fakeCategory._id}`)
      .auth(accessToken, { type: 'bearer' })
      .field('name', categoryObjectToUpdate.name)
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
