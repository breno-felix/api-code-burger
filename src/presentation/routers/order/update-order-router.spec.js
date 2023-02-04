const UpdateOrderRouter = require('./update-order-router')
const { ServerError } = require('../../errors')
const {
  MissingParamError,
  InvalidParamError,
  OrderNotCreatedError
} = require('../../../utils/errors')

const makeSut = () => {
  const objectShapeValidatorSpy = makeObjectShapeValidator()
  const updateOrderUseCaseSpy = makeUpdateOrderUseCase()

  const sut = new UpdateOrderRouter({
    objectShapeValidator: objectShapeValidatorSpy,
    updateOrderUseCase: updateOrderUseCaseSpy
  })

  return {
    sut,
    objectShapeValidatorSpy,
    updateOrderUseCaseSpy
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

const makeUpdateOrderUseCase = () => {
  class UpdateOrderUseCaseSpy {
    async update(httpRequest) {
      this.status = httpRequest.status
      this.order_id = httpRequest.order_id
    }
  }
  const updateOrderUseCaseSpy = new UpdateOrderUseCaseSpy()
  updateOrderUseCaseSpy.isRegistered = true
  return updateOrderUseCaseSpy
}

const makeUpdateOrderUseCaseWithOrderNotCreatedError = () => {
  class UpdateOrderUseCaseSpy {
    async update() {
      throw new OrderNotCreatedError()
    }
  }
  return new UpdateOrderUseCaseSpy()
}

const makeUpdateOrderUseCaseWithError = () => {
  class UpdateOrderUseCaseSpy {
    async update() {
      throw new Error()
    }
  }
  return new UpdateOrderUseCaseSpy()
}

const requiredParams = ['status']
const invalidRequests = [undefined, {}]

describe('Update Order Router', () => {
  requiredParams.forEach((param) => {
    test(`Should return 400 if no ${param} is provided`, async () => {
      const { sut } = makeSut()
      const httpRequest = {
        body: {
          status: 'any_name'
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
        status: 'any_name'
      },
      params: {
        order_id: 'any_order_id'
      }
    }
    await sut.route(httpRequest)
    expect(objectShapeValidatorSpy.httpRequest).toBe(httpRequest.body)
  })

  test('Should return 400 if an invalid param is provided', async () => {
    const sut = new UpdateOrderRouter({
      objectShapeValidator: makeObjectShapeValidatorWithInvalidParamError()
    })

    const httpRequest = {
      body: {
        status: 'invalid_name'
      },
      params: {
        order_id: 'any_order_id'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
  })

  test('Should call UpdateOrderUseCase with correct params', async () => {
    const { sut, updateOrderUseCaseSpy } = makeSut()

    const updateSpy = jest.spyOn(updateOrderUseCaseSpy, 'update')

    const httpRequest = {
      body: {
        status: 'any_name'
      },
      params: {
        order_id: 'any_order_id'
      }
    }
    await sut.route(httpRequest)
    expect(updateSpy).toHaveBeenCalledWith({
      status: httpRequest.body.status,
      order_id: httpRequest.params.order_id
    })
  })

  test('Should return 204 when valid params are provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        status: 'any_name'
      },
      params: {
        order_id: 'any_order_id'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(204)
    expect(httpResponse.body).toBe(
      'The request was successfully processed but is not returning any content.'
    )
  })

  test('Should return 400 when order_id does not exist in order database', async () => {
    const objectShapeValidator = makeObjectShapeValidator()

    const sut = new UpdateOrderRouter({
      updateOrderUseCase: makeUpdateOrderUseCaseWithOrderNotCreatedError(),
      objectShapeValidator
    })

    const httpRequest = {
      body: {
        status: 'any_name'
      },
      params: {
        order_id: 'invalid_order_id'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body.error).toBe(new OrderNotCreatedError().message)
  })

  test('Should return 500 if invalid dependencies are provided', async () => {
    const invalid = {}
    const objectShapeValidator = makeObjectShapeValidator()
    const suts = [].concat(
      new UpdateOrderRouter(),
      new UpdateOrderRouter({}),
      new UpdateOrderRouter({
        objectShapeValidator: invalid
      }),
      new UpdateOrderRouter({
        objectShapeValidator
      }),
      new UpdateOrderRouter({
        objectShapeValidator,
        updateOrderUseCase: invalid
      })
    )
    for (const sut of suts) {
      const httpRequest = {
        body: {
          status: 'any_name'
        },
        params: {
          order_id: 'any_order_id'
        }
      }
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(500)
      expect(httpResponse.body.error).toBe(new ServerError().message)
    }
  })

  test('Should return 500 if any dependency throw a new Error()', async () => {
    const objectShapeValidator = makeObjectShapeValidator()
    const suts = [].concat(
      new UpdateOrderRouter({
        objectShapeValidator: makeObjectShapeValidatorWithError()
      }),
      new UpdateOrderRouter({
        objectShapeValidator,
        updateOrderUseCase: makeUpdateOrderUseCaseWithError()
      })
    )
    for (const sut of suts) {
      const httpRequest = {
        body: {
          status: 'any_name'
        },
        params: {
          order_id: 'any_order_id'
        }
      }
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(500)
      expect(httpResponse.body.error).toBe(new ServerError().message)
    }
  })
})
