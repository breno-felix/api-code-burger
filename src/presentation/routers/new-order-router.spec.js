const HttpResponse = require('../helpers/http-response')

class NewOrderRouter {
  async route(httpRequest) {
    try {
      const requiredParams = ['products']
      requiredParams.forEach((param) => {
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
  const sut = new NewOrderRouter()

  return {
    sut
  }
}

const requiredParams = ['products']

describe('New Order Router', () => {
  requiredParams.forEach((param) => {
    test(`Should return 400 if no ${param} is provided`, async () => {
      const { sut } = makeSut()
      const httpRequest = {
        body: {
          products: ['any_array']
        }
      }
      delete httpRequest.body[param]
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(400)
      expect(httpResponse.body.error).toBe(new MissingParamError(param).message)
    })
  })
})
