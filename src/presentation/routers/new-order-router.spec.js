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
      return HttpResponse.serverError()
    }
  }
}

const { ServerError } = require('../errors')
const { MissingParamError } = require('../../utils/errors')

const makeSut = () => {
  const sut = new NewOrderRouter()

  return {
    sut
  }
}

const requiredParams = ['products']
const invalidRequests = [undefined, {}]

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

  invalidRequests.forEach((httpRequest) => {
    test('Should return 500 if the httpRequest is invalid', async () => {
      const { sut } = makeSut()
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(500)
      expect(httpResponse.body.error).toBe(new ServerError().message)
    })
  })
})
