const HttpResponse = require('../helpers/http-response')

class NewOrderRouter {
  constructor({ objectShapeValidator, newOrderUseCase } = {}) {
    this.objectShapeValidator = objectShapeValidator
    this.newOrderUseCase = newOrderUseCase
  }

  async route(httpRequest) {
    try {
      const requiredParams = ['products']
      requiredParams.forEach((param) => {
        if (!httpRequest.body[param]) {
          throw new MissingParamError(param)
        }
      })
      await this.objectShapeValidator.isValid(httpRequest.body)
      await this.newOrderUseCase.record(httpRequest.body)
      return HttpResponse.created()
    } catch (error) {
      if (error instanceof ProductNotCreatedError) {
        return HttpResponse.badRequest(new ProductNotCreatedError())
      } else if (error instanceof InvalidParamError) {
        return HttpResponse.badRequest(error)
      } else if (error instanceof MissingParamError) {
        return HttpResponse.badRequest(error)
      }
      return HttpResponse.serverError()
    }
  }
}

const { ServerError } = require('../errors')
const {
  MissingParamError,
  InvalidParamError,
  ProductNotCreatedError
} = require('../../utils/errors')

const makeSut = () => {
  const objectShapeValidatorSpy = makeObjectShapeValidator()
  const newOrderUseCaseSpy = makeNewOrderUseCase()

  const sut = new NewOrderRouter({
    objectShapeValidator: objectShapeValidatorSpy,
    newOrderUseCase: newOrderUseCaseSpy
  })

  return {
    sut,
    objectShapeValidatorSpy,
    newOrderUseCaseSpy
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

const makeObjectShapeValidatorWithError = () => {
  class ObjectShapeValidatorSpy {
    async isValid() {
      throw new Error()
    }
  }
  return new ObjectShapeValidatorSpy()
}

const makeNewOrderUseCase = () => {
  class NewOrderUseCaseSpy {
    async record(httpRequest) {
      this.products = httpRequest.products
      return this.isRegistered
    }
  }
  const newOrderUseCaseSpy = new NewOrderUseCaseSpy()
  newOrderUseCaseSpy.isRegistered = true
  return newOrderUseCaseSpy
}

const makeNewOrderUseCaseWithProductNotCreatedError = () => {
  class NewOrderUseCaseSpy {
    async record() {
      throw new ProductNotCreatedError()
    }
  }
  return new NewOrderUseCaseSpy()
}

const makeNewOrderUseCaseWithError = () => {
  class NewOrderUseCaseSpy {
    async record() {
      throw new Error()
    }
  }
  return new NewOrderUseCaseSpy()
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

  test('Should call objectShapeValidator with correct httpRequest.body', async () => {
    const { sut, objectShapeValidatorSpy } = makeSut()
    const httpRequest = {
      body: {
        products: ['any_array']
      }
    }
    await sut.route(httpRequest)
    expect(objectShapeValidatorSpy.httpRequest).toBe(httpRequest.body)
  })

  test('Should return 400 if an invalid param is provided', async () => {
    const sut = new NewOrderRouter({
      objectShapeValidator: makeObjectShapeValidatorWithInvalidParamError()
    })

    const httpRequest = {
      body: {
        products: ['any_array']
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
  })

  test('Should call NewOrderUseCase with correct params', async () => {
    const { sut, newOrderUseCaseSpy } = makeSut()
    const httpRequest = {
      body: {
        products: ['any_array']
      }
    }
    await sut.route(httpRequest)
    requiredParams.forEach((param) => {
      expect(newOrderUseCaseSpy[param]).toBe(httpRequest.body[param])
    })
  })

  test('Should return 201 when valid params are provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        products: ['any_array']
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(201)
    expect(httpResponse.body).toBe(
      'The request was successful and a new resource was created as a result.'
    )
  })

  test('Should return 400 when some product_id of products does not exist in product database', async () => {
    const objectShapeValidator = makeObjectShapeValidator()

    const sut = new NewOrderRouter({
      newOrderUseCase: makeNewOrderUseCaseWithProductNotCreatedError(),
      objectShapeValidator
    })

    const httpRequest = {
      body: {
        products: ['any_array']
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body.error).toBe(new ProductNotCreatedError().message)
  })

  test('Should return 500 if invalid dependencies are provided', async () => {
    const invalid = {}
    const newOrderUseCase = makeNewOrderUseCase()
    const suts = [].concat(
      new NewOrderRouter(),
      new NewOrderRouter({}),
      new NewOrderRouter({
        newOrderUseCase: invalid
      }),
      new NewOrderRouter({
        newOrderUseCase
      }),
      new NewOrderRouter({
        newOrderUseCase,
        objectShapeValidator: invalid
      })
    )
    for (const sut of suts) {
      const httpRequest = {
        body: {
          products: ['any_array']
        }
      }
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(500)
      expect(httpResponse.body.error).toBe(new ServerError().message)
    }
  })

  test('Should return 500 if any dependency throw a new Error()', async () => {
    const newOrderUseCase = makeNewOrderUseCase()
    const suts = [].concat(
      new NewOrderRouter({
        newOrderUseCase: makeNewOrderUseCaseWithError()
      }),
      new NewOrderRouter({
        newOrderUseCase,
        objectShapeValidator: makeObjectShapeValidatorWithError()
      })
    )
    for (const sut of suts) {
      const httpRequest = {
        body: {
          products: ['any_array']
        }
      }
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(500)
      expect(httpResponse.body.error).toBe(new ServerError().message)
    }
  })
})
