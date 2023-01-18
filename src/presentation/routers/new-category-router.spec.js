const HttpResponse = require('../helpers/http-response')

class NewCategoryRouter {
  constructor({ newCategoryUseCase, objectShapeValidator } = {}) {
    this.newCategoryUseCase = newCategoryUseCase
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
      await this.newCategoryUseCase.record(httpRequest.body)
      return HttpResponse.created()
    } catch (error) {
      if (error instanceof InvalidParamError) {
        return HttpResponse.badRequest(error)
      } else if (error instanceof MissingParamError) {
        return HttpResponse.badRequest(error)
      }
      return HttpResponse.serverError()
    }
  }
}

const { ServerError } = require('../errors')
const { MissingParamError, InvalidParamError } = require('../../utils/errors')

const makeSut = () => {
  const objectShapeValidatorSpy = makeObjectShapeValidator()
  const newCategoryUseCaseSpy = makeNewCategoryUseCaseSpy()

  const sut = new NewCategoryRouter({
    objectShapeValidator: objectShapeValidatorSpy,
    newCategoryUseCase: newCategoryUseCaseSpy
  })

  return {
    sut,
    objectShapeValidatorSpy,
    newCategoryUseCaseSpy
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

const makeObjectShapeValidatorWithInvalidParamError = () => {
  class ObjectShapeValidatorSpy {
    async isValid() {
      throw new InvalidParamError('description of some invalid parameter')
    }
  }
  return new ObjectShapeValidatorSpy()
}

const makeNewCategoryUseCaseSpy = () => {
  class NewCategoryUseCaseSpySpy {
    async record(httpRequest) {
      this.name = httpRequest.name
      return this.isRegistered
    }
  }
  const newCategoryUseCaseSpySpy = new NewCategoryUseCaseSpySpy()
  newCategoryUseCaseSpySpy.isRegistered = true
  return newCategoryUseCaseSpySpy
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

    test('Should return 400 if an invalid param is provided', async () => {
      const newCategoryUseCase = makeNewCategoryUseCaseSpy()

      const sut = new NewCategoryRouter({
        objectShapeValidator: makeObjectShapeValidatorWithInvalidParamError(),
        newCategoryUseCase
      })

      const httpRequest = {
        body: {
          name: 'invalid_name'
        }
      }
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(400)
    })

    test('Should call NewCategoryUseCase with correct params', async () => {
      const { sut, newCategoryUseCaseSpy } = makeSut()
      const httpRequest = {
        body: {
          name: 'any_name'
        }
      }
      await sut.route(httpRequest)
      requiredParams.forEach((param) => {
        expect(newCategoryUseCaseSpy[param]).toBe(httpRequest.body[param])
      })
    })

    test('Should return 201 when valid params are provided', async () => {
      const { sut } = makeSut()
      const httpRequest = {
        body: {
          name: 'valid_name'
        }
      }
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(201)
      expect(httpResponse.body).toBe(
        'The request was successful and a new resource was created as a result.'
      )
    })
  })
})
