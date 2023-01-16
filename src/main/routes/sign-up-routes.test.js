const request = require('supertest')
const app = require('../config/app')
const MongooseHelper = require('../../infra/helpers/mongoose-helper')
const env = require('../config/envfile')

describe('Login Routes', () => {
  beforeAll(async () => {
    await MongooseHelper.connect(env.urlMongooseTest)
  })

  afterAll(async () => {
    await MongooseHelper.disconnect()
  })

  test('Should return 201 when valid data are provided', async () => {
    await request(app)
      .post('/api/sign-up')
      .send({
        name: 'valid_name',
        email: 'valid_email@mail.com',
        password: 'valid_password',
        repeatPassword: 'valid_password'
      })
      .expect(201)
  })
})
