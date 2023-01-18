const HttpResponse = require('../helpers/http-response')

class NewCategoryRouter {
  async route(httpRequest) {
    try {
      const requiredParams = ['name']
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
  const sut = new NewCategoryRouter()

  return {
    sut
  }
}

const requiredParams = ['name']

describe('New Category Router', () => {
  requiredParams.forEach((param) => {
    test(`Should return 400 if no ${param} is provided`, async () => {
      const { sut } = makeSut()
      const httpRequest = {
        body: {
          name: 'any_name'
        }
      }
      delete httpRequest.body[param]
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(400)
      expect(httpResponse.body.error).toBe(new MissingParamError(param).message)
    })
  })
})
