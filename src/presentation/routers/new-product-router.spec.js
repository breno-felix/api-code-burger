const HttpResponse = require('../helpers/http-response')

class NewProductRouter {
  async route(httpRequest) {
    try {
      const requiredParamsBody = ['name', 'price', 'category']
      requiredParamsBody.forEach((param) => {
        if (!httpRequest.body[param]) {
          throw new MissingParamError(param)
        }
      })
    } catch (error) {
      if (error instanceof MissingParamError) {
        return HttpResponse.badRequest(error)
      }
    }
  }
}

const { MissingParamError } = require('../../utils/errors')

const makeSut = () => {
  const sut = new NewProductRouter()

  return {
    sut
  }
}

const requiredParamsBody = ['name', 'price', 'category']

describe('New Product Router', () => {
  requiredParamsBody.forEach((param) => {
    test(`Should return 400 if no ${param} is provided in httpRequest.body`, async () => {
      const { sut } = makeSut()
      const httpRequest = {
        body: {
          name: 'any_name',
          price: 10.01,
          category: 'any_id_category'
        }
      }
      delete httpRequest.body[param]
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(400)
      expect(httpResponse.body.error).toBe(new MissingParamError(param).message)
    })
  })
})
