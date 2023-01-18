const HttpResponse = require('../helpers/http-response')

class NewCategoryRouter {
  constructor({ objectShapeValidator } = {}) {
    this.objectShapeValidator = objectShapeValidator
  }

  async route(httpRequest) {
    try {
      const requiredParams = ['name']
      requiredParams.forEach((param) => {
        if (!httpRequest.body[param]) {
          throw new MissingParamError(param)
        }
      })
      await this.objectShapeValidator.isValid(httpRequest.body)
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
  const objectShapeValidatorSpy = makeObjectShapeValidator()

  const sut = new NewCategoryRouter({
    objectShapeValidator: objectShapeValidatorSpy
  })

  return {
    sut,
    objectShapeValidatorSpy
  }
}

const makeObjectShapeValidator = () => {
  class ObjectShapeValidatorSpy {
    async isValid(httpRequest) {
      this.httpRequest = httpRequest
    }
  }

  const objectShapeValidatorSpy = new ObjectShapeValidatorSpy()
  return objectShapeValidatorSpy
}

const requiredParams = ['name']
const invalidRequests = [undefined, {}]

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

    invalidRequests.forEach((httpRequest) => {
      test('Should return 500 if the httpRequest is invalid', async () => {
        const { sut } = makeSut()
        const httpResponse = await sut.route(httpRequest)
        expect(httpResponse.statusCode).toBe(500)
        expect(httpResponse.body.error).toBe(new ServerError().message)
      })
    })

    test('Should call objectShapeValidator with correct httpRequest.body', async () => {
      const { sut, objectShapeValidatorSpy } = makeSut()
      const httpRequest = {
        body: {
          name: 'any_name'
        }
      }
      await sut.route(httpRequest)
      expect(objectShapeValidatorSpy.httpRequest).toBe(httpRequest.body)
    })
  })
})
