const NewCategoryRouter = require('./new-category-router')
const { ServerError } = require('../../errors')
const {
  MissingParamError,
  InvalidParamError,
  RepeatedNameError
} = require('../../../utils/errors')

const makeSut = () => {
  const objectShapeValidatorSpy = makeObjectShapeValidator()
  const newCategoryUseCaseSpy = makeNewCategoryUseCase()

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

const makeObjectShapeValidatorWithError = () => {
  class ObjectShapeValidatorSpy {
    async isValid() {
      throw new Error()
    }
  }
  return new ObjectShapeValidatorSpy()
}

const makeNewCategoryUseCase = () => {
  class NewCategoryUseCaseSpy {
    async record(httpRequest) {
      this.name = httpRequest.name
      return this.isRegistered
    }
  }
  const newCategoryUseCaseSpy = new NewCategoryUseCaseSpy()
  newCategoryUseCaseSpy.isRegistered = true
  return newCategoryUseCaseSpy
}

const makeNewCategoryUseCaseWithRepeatedNameError = () => {
  class NewCategoryUseCaseSpy {
    async record() {
      throw new RepeatedNameError()
    }
  }
  return new NewCategoryUseCaseSpy()
}

const makeNewCategoryUseCaseWithError = () => {
  class NewCategoryUseCaseSpy {
    async record() {
      throw new Error()
    }
  }
  return new NewCategoryUseCaseSpy()
}

const requiredParams = ['name']
const requiredParamsFile = ['key']
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
  })

  requiredParamsFile.forEach((param) => {
    test(`Should return 400 if no ${param} is provided in httpRequest.file`, async () => {
      const { sut } = makeSut()
      const httpRequest = {
        body: {
          name: 'any_name'
        },
        file: {
          key: 'any_name'
        }
      }
      delete httpRequest.file[param]
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(400)
      expect(httpResponse.body.error).toBe(new MissingParamError(param).message)
    })
  })

  test(`Should return 400 if no httpRequest.body is provided`, async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {},
      file: {
        key: 'any_name'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body.error).toBe(new MissingParamError('name').message)
  })

  test(`Should return 400 if no httpRequest.file is provided`, async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'any_name'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body.error).toBe(new MissingParamError('key').message)
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
      },
      file: {
        key: 'any_name'
      }
    }
    await sut.route(httpRequest)
    expect(objectShapeValidatorSpy.httpRequest).toBe(httpRequest.body)
  })

  test('Should return 400 if an invalid param is provided', async () => {
    const newCategoryUseCase = makeNewCategoryUseCase()

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

    const recordSpy = jest.spyOn(newCategoryUseCaseSpy, 'record')

    const httpRequest = {
      body: {
        name: 'any_name'
      },
      file: {
        key: 'any_name'
      }
    }
    await sut.route(httpRequest)

    expect(recordSpy).toHaveBeenCalledWith({
      name: httpRequest.body.name,
      imagePath: httpRequest.file.key
    })
  })

  test('Should return 201 when valid params are provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'valid_name'
      },
      file: {
        key: 'valid_name'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(201)
    expect(httpResponse.body).toBe(
      'The request was successful and a new resource was created as a result.'
    )
  })

  test('Should return 400 when name provided is not unique in category database', async () => {
    const objectShapeValidator = makeObjectShapeValidator()

    const sut = new NewCategoryRouter({
      newCategoryUseCase: makeNewCategoryUseCaseWithRepeatedNameError(),
      objectShapeValidator
    })

    const httpRequest = {
      body: {
        name: 'any_name'
      },
      file: {
        key: 'any_name'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body.error).toBe(new RepeatedNameError().message)
  })

  test('Should return 500 if invalid dependencies are provided', async () => {
    const invalid = {}
    const newCategoryUseCase = makeNewCategoryUseCase()
    const suts = [].concat(
      new NewCategoryRouter(),
      new NewCategoryRouter({}),
      new NewCategoryRouter({
        newCategoryUseCase: invalid
      }),
      new NewCategoryRouter({
        newCategoryUseCase
      }),
      new NewCategoryRouter({
        newCategoryUseCase,
        objectShapeValidator: invalid
      })
    )
    for (const sut of suts) {
      const httpRequest = {
        body: {
          name: 'any_name'
        },
        file: {
          key: 'any_name'
        }
      }
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(500)
      expect(httpResponse.body.error).toBe(new ServerError().message)
    }
  })

  test('Should return 500 if any dependency throw a new Error()', async () => {
    const newCategoryUseCase = makeNewCategoryUseCase()
    const suts = [].concat(
      new NewCategoryRouter({
        newCategoryUseCase: makeNewCategoryUseCaseWithError()
      }),
      new NewCategoryRouter({
        newCategoryUseCase,
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
        }
      }
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(500)
      expect(httpResponse.body.error).toBe(new ServerError().message)
    }
  })
})
