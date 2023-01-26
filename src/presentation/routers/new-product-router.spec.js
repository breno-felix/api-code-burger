const NewProductRouter = require('./new-product-router')
const { ServerError } = require('../errors')
const { MissingParamError, InvalidParamError } = require('../../utils/errors')

const makeSut = () => {
  const objectShapeValidatorSpy = makeObjectShapeValidator()
  const newProductUseCaseSpy = makeNewProductUseCase()

  const sut = new NewProductRouter({
    objectShapeValidator: objectShapeValidatorSpy,
    newProductUseCase: newProductUseCaseSpy
  })

  return {
    sut,
    objectShapeValidatorSpy,
    newProductUseCaseSpy
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

const makeNewProductUseCase = () => {
  class NewProductUseCaseSpy {
    async record({ name, price, category_id, imagePath }) {
      this.name = name
      this.email = price
      this.password = category_id
      this.admin = imagePath
    }
  }
  const newProductUseCaseSpy = new NewProductUseCaseSpy()
  return newProductUseCaseSpy
}

const makeNewProductUseCaseWithError = () => {
  class NewProductUseCaseSpy {
    async record() {
      throw new Error()
    }
  }
  return new NewProductUseCaseSpy()
}

const requiredParamsBody = ['name', 'price', 'category_id']
const requiredParamsFile = ['key']
const invalidRequests = [undefined, {}]

describe('New Product Router', () => {
  requiredParamsBody.forEach((param) => {
    test(`Should return 400 if no ${param} is provided in httpRequest.body`, async () => {
      const { sut } = makeSut()
      const httpRequest = {
        body: {
          name: 'any_name',
          price: 10.01,
          category_id: 'any_category_id'
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
          name: 'any_name',
          price: 10.01,
          category_id: 'any_category_id'
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
        name: 'any_name',
        price: 10.01,
        category_id: 'any_category_id'
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
        name: 'any_name',
        price: 10.01,
        category_id: 'any_category_id'
      },
      file: {
        key: 'any_name'
      }
    }
    await sut.route(httpRequest)
    expect(objectShapeValidatorSpy.httpRequest).toBe(httpRequest.body)
  })

  test('Should return 400 if an invalid param is provided', async () => {
    const sut = new NewProductRouter({
      objectShapeValidator: makeObjectShapeValidatorWithInvalidParamError()
    })

    const httpRequest = {
      body: {
        name: 'invalid_name',
        price: 'invalid_price',
        category_id: 'invalid_category_id'
      },
      file: {
        key: 'any_name'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
  })

  test('Should call newProductUseCase with correct values', async () => {
    const { sut, newProductUseCaseSpy } = makeSut()

    const recordSpy = jest.spyOn(newProductUseCaseSpy, 'record')

    const httpRequest = {
      body: {
        name: 'valid_name',
        price: 10.01,
        category_id: 'valid_category_id'
      },
      file: {
        key: 'valid_name'
      }
    }

    await sut.route(httpRequest)
    expect(recordSpy).toHaveBeenCalledWith({
      name: httpRequest.body.name,
      price: httpRequest.body.price,
      category_id: httpRequest.body.category_id,
      imagePath: httpRequest.file.key
    })
  })

  test('Should return 201 when valid params are provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'valid_name',
        price: 10.01,
        category_id: 'valid_category_id'
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

  test('Should return 500 if invalid dependencies are provided', async () => {
    const invalid = {}
    const objectShapeValidator = makeObjectShapeValidator()
    const suts = [].concat(
      new NewProductRouter(),
      new NewProductRouter({}),
      new NewProductRouter({
        objectShapeValidator: invalid
      }),
      new NewProductRouter({
        objectShapeValidator
      }),
      new NewProductRouter({
        objectShapeValidator,
        newProductUseCase: invalid
      })
    )
    for (const sut of suts) {
      const httpRequest = {
        body: {
          name: 'any_name',
          price: 10.01,
          category_id: 'any_category_id'
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
    const objectShapeValidator = makeObjectShapeValidator()

    const suts = [].concat(
      new NewProductRouter({
        objectShapeValidator: makeObjectShapeValidatorWithError()
      }),
      new NewProductRouter({
        objectShapeValidator,
        newProductUseCase: makeNewProductUseCaseWithError()
      })
    )
    for (const sut of suts) {
      const httpRequest = {
        body: {
          name: 'any_name',
          price: 10.01,
          category_id: 'any_category_id'
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
