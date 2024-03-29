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

describe('New Category Routes', () => {
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
    await request(app).post('/api/new-category').expect(401)
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
      .post('/api/new-category')
      .auth(accessTokenTwo, { type: 'bearer' })
      .expect(403)
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
      .field('name', categoryTest.name)
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

    categories = await CategoryModel.find({})
    expect(categories.length).toBe(1)
    expect(categories[0]._id).toEqual(expect.anything())
    expect(categories[0].name).toBe(categoryTest.name)
    expect(categories[0].imagePath).toEqual(expect.anything())
    await categories[0].remove()
  })

  test('Should return 400 if no name is provided', async () => {
    const response = await request(app)
      .post('/api/new-category')
      .auth(accessToken, { type: 'bearer' })
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

  test('Should return 400 if no file is provided', async () => {
    const categoryTest = {
      name: 'valid_name'
    }

    const response = await request(app)
      .post('/api/new-category')
      .auth(accessToken, { type: 'bearer' })
      .send(categoryTest)
    expect(response.status).toBe(400)
  })

  test('Should return 400 when name is not unique', async () => {
    let categories = await CategoryModel.find({})
    expect(categories.length).toBe(0)

    const category = {
      name: 'any_name'
    }
    await request(app)
      .post('/api/new-category')
      .auth(accessToken, { type: 'bearer' })
      .field('name', category.name)
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
      .expect(201)
    categories = await CategoryModel.find({})
    expect(categories.length).toBe(1)

    const categoryTest = {
      name: 'any_name'
    }
    const response = await request(app)
      .post('/api/new-category')
      .auth(accessToken, { type: 'bearer' })
      .field('name', categoryTest.name)
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
    await categories[0].remove()
  })
})
