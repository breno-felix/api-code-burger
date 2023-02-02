const UpdateCategoryRouter = require('./update-category-router')
const { ServerError } = require('../../errors')
const {
  MissingParamError,
  InvalidParamError,
  RepeatedNameError,
  CategoryNotCreatedError
} = require('../../../utils/errors')

const makeSut = () => {
  const objectShapeValidatorSpy = makeObjectShapeValidator()
  const updateCategoryUseCaseSpy = makeUpdateCategoryUseCase()

  const sut = new UpdateCategoryRouter({
    objectShapeValidator: objectShapeValidatorSpy,
    updateCategoryUseCase: updateCategoryUseCaseSpy
  })

  return {
    sut,
    objectShapeValidatorSpy,
    updateCategoryUseCaseSpy
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

const makeUpdateCategoryUseCase = () => {
  class UpdateCategoryUseCaseSpy {
    async update(httpRequest) {
      this.name = httpRequest.name
      this.imagePath = httpRequest.imagePath
      this.category_id = httpRequest.category_id
    }
  }
  const updateCategoryUseCaseSpy = new UpdateCategoryUseCaseSpy()
  return updateCategoryUseCaseSpy
}

const makeUpdateCategoryUseCaseWithRepeatedNameError = () => {
  class UpdateCategoryUseCaseSpy {
    async update() {
      throw new RepeatedNameError()
    }
  }
  return new UpdateCategoryUseCaseSpy()
}

const makeUpdateCategoryUseCaseWithCategoryNotCreatedError = () => {
  class UpdateCategoryUseCaseSpy {
    async update() {
      throw new CategoryNotCreatedError()
    }
  }
  return new UpdateCategoryUseCaseSpy()
}

const makeUpdateCategoryUseCaseWithMissingParamError = () => {
  class UpdateCategoryUseCaseSpy {
    async update() {
      throw new MissingParamError('all params')
    }
  }
  return new UpdateCategoryUseCaseSpy()
}

const makeUpdateCategoryUseCaseWithError = () => {
  class UpdateCategoryUseCaseSpy {
    async update() {
      throw new Error()
    }
  }
  return new UpdateCategoryUseCaseSpy()
}

const invalidRequests = [undefined, {}]

describe('Update Category Router', () => {
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
      },
      file: {
        key: 'any_name'
      },
      params: {
        category_id: 'any_category_id'
      }
    }
    await sut.route(httpRequest)
    expect(objectShapeValidatorSpy.httpRequest).toBe(httpRequest.body)
  })

  test('Should return 400 if an invalid param is provided', async () => {
    const updateCategoryUseCase = makeUpdateCategoryUseCase()

    const sut = new UpdateCategoryRouter({
      objectShapeValidator: makeObjectShapeValidatorWithInvalidParamError(),
      updateCategoryUseCase
    })

    const httpRequest = {
      body: {
        name: 'invalid_name'
      },
      file: {
        key: 'any_name'
      },
      params: {
        category_id: 'any_category_id'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
  })

  test('Should call UpdateCategoryUseCase with correct params', async () => {
    const { sut, updateCategoryUseCaseSpy } = makeSut()

    const updateSpy = jest.spyOn(updateCategoryUseCaseSpy, 'update')

    const httpRequest = {
      body: {
        name: 'any_name'
      },
      file: {
        key: 'any_name'
      },
      params: {
        category_id: 'any_category_id'
      }
    }
    await sut.route(httpRequest)
    expect(updateSpy).toHaveBeenCalledWith({
      name: httpRequest.body.name,
      imagePath: httpRequest.file.key,
      category_id: httpRequest.params.category_id
    })
  })

  test('Should return 204 when valid params are provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'valid_name'
      },
      file: {
        key: 'valid_name'
      },
      params: {
        category_id: 'valid_category_id'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(204)
    expect(httpResponse.body).toBe(
      'The request was successfully processed but is not returning any content.'
    )
  })

  test('Should return 204 when valid params and no file are provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'valid_name'
      },
      params: {
        category_id: 'valid_category_id'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(204)
    expect(httpResponse.body).toBe(
      'The request was successfully processed but is not returning any content.'
    )
  })

  test('Should return 400 when name provided is not unique in category database', async () => {
    const objectShapeValidator = makeObjectShapeValidator()

    const sut = new UpdateCategoryRouter({
      updateCategoryUseCase: makeUpdateCategoryUseCaseWithRepeatedNameError(),
      objectShapeValidator
    })

    const httpRequest = {
      body: {
        name: 'invalid_name'
      },
      file: {
        key: 'valid_name'
      },
      params: {
        category_id: 'valid_category_id'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body.error).toBe(new RepeatedNameError().message)
  })

  test('Should return 400 when category_id does not exist in category database', async () => {
    const objectShapeValidator = makeObjectShapeValidator()

    const sut = new UpdateCategoryRouter({
      updateCategoryUseCase:
        makeUpdateCategoryUseCaseWithCategoryNotCreatedError(),
      objectShapeValidator
    })

    const httpRequest = {
      body: {
        name: 'valid_name'
      },
      file: {
        key: 'valid_name'
      },
      params: {
        category_id: 'invalid_category_id'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body.error).toBe(new CategoryNotCreatedError().message)
  })

  test('Should return 400 when no params is provided', async () => {
    const objectShapeValidator = makeObjectShapeValidator()

    const sut = new UpdateCategoryRouter({
      updateCategoryUseCase: makeUpdateCategoryUseCaseWithMissingParamError(),
      objectShapeValidator
    })

    const httpRequest = {
      body: {},
      params: {
        category_id: 'valid_category_id'
      }
    }

    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body.error).toBe(
      new MissingParamError('all params').message
    )
  })

  test('Should return 500 if invalid dependencies are provided', async () => {
    const invalid = {}
    const objectShapeValidator = makeObjectShapeValidator()
    const suts = [].concat(
      new UpdateCategoryRouter(),
      new UpdateCategoryRouter({}),
      new UpdateCategoryRouter({
        objectShapeValidator: invalid
      }),
      new UpdateCategoryRouter({
        objectShapeValidator
      }),
      new UpdateCategoryRouter({
        objectShapeValidator,
        updateCategoryUseCase: invalid
      })
    )
    for (const sut of suts) {
      const httpRequest = {
        body: {
          name: 'any_name'
        },
        file: {
          key: 'any_name'
        },
        params: {
          category_id: 'any_category_id'
        }
      }
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(500)
      expect(httpResponse.body.error).toBe(new ServerError().message)
    }
  })

  test('Should return 500 if any dependency throw a new Error()', async () => {
    const updateCategoryUseCase = makeUpdateCategoryUseCase()
    const suts = [].concat(
      new UpdateCategoryRouter({
        updateCategoryUseCase: makeUpdateCategoryUseCaseWithError()
      }),
      new UpdateCategoryRouter({
        updateCategoryUseCase,
        objectShapeValidator: makeObjectShapeValidatorWithError()
      })
    )
    for (const sut of suts) {
      const httpRequest = {
        body: {
          name: 'any_name'
        },
        file: {
          key: 'any_name'
        },
        params: {
          category_id: 'any_category_id'
        }
      }
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(500)
      expect(httpResponse.body.error).toBe(new ServerError().message)
    }
  })
})
