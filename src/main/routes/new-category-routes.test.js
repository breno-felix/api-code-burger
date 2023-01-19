const request = require('supertest')
const app = require('../config/app')
const MongooseHelper = require('../../infra/helpers/mongoose-helper')
const env = require('../config/envfile')
const CategoryModel = require('../../infra/entities/CategoryModel')

describe('New Category Routes', () => {
  beforeAll(async () => {
    await MongooseHelper.connect(env.urlMongooseTest)
  })

  beforeEach(async () => {
    await CategoryModel.deleteMany()
  })

  afterAll(async () => {
    await MongooseHelper.disconnect()
  })

  const requiredParams = ['name']

  test('Should return 201 when valid data are provided', async () => {
    let categories = await CategoryModel.find({})
    expect(categories.length).toBe(0)

    const categoryTest = {
      name: 'valid_name'
    }
    const response = await request(app)
      .post('/api/new-category')
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
        .send(categoryTest)
      expect(response.status).toBe(400)
    })
  })
})
