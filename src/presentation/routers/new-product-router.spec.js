const HttpResponse = require('../helpers/http-response')

class NewProductRouter {
  constructor({ objectShapeValidator, createProductRepository } = {}) {
    this.objectShapeValidator = objectShapeValidator
    this.createProductRepository = createProductRepository
  }

  async route(httpRequest) {
    try {
      const requiredParamsBody = ['name', 'price', 'category_id']
      requiredParamsBody.forEach((param) => {
        if (!httpRequest.body[param]) {
          throw new MissingParamError(param)
        }
      })
      const requiredParamsFile = ['filename']
      requiredParamsFile.forEach((param) => {
        if (!httpRequest.file[param]) {
          throw new MissingParamError(param)
        }
      })
      await this.objectShapeValidator.isValid(httpRequest.body)
      await this.createProductRepository.create({
        name: httpRequest.body.name,
        price: httpRequest.body.price,
        category_id: httpRequest.body.category_id,
        imagePath: httpRequest.file.filename
      })
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
  const createProductRepositorySpy = makeCreateProductRepository()

  const sut = new NewProductRouter({
    objectShapeValidator: objectShapeValidatorSpy,
    createProductRepository: createProductRepositorySpy
  })

  return {
    sut,
    objectShapeValidatorSpy,
    createProductRepositorySpy
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

const makeCreateProductRepository = () => {
  class CreateProductRepositorySpy {
    async create({ name, price, category_id, imagePath }) {
      this.name = name
      this.email = price
      this.password = category_id
      this.admin = imagePath
    }
  }
  const createProductRepositorySpy = new CreateProductRepositorySpy()
  return createProductRepositorySpy
}

const makeCreateProductRepositoryWithError = () => {
  class CreateProductRepositorySpy {
    async create() {
      throw new Error()
    }
  }
  return new CreateProductRepositorySpy()
}

const requiredParamsBody = ['name', 'price', 'category_id']
const requiredParamsFile = ['filename']
const invalidRequests = [
  undefined,
  {},
  {
    file: {
      filename: 'any_name'
    }
  },
  {
    body: {
      name: 'any_name',
      price: 10.01,
      category_id: 'any_category_id'
    }
  }
]

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
          filename: 'any_name'
        }
      }
      delete httpRequest.file[param]
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
        name: 'any_name',
        price: 10.01,
        category_id: 'any_category_id'
      },
      file: {
        filename: 'any_name'
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
        filename: 'any_name'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
  })

  test('Should call CreateProductRepository with correct values', async () => {
    const { sut, createProductRepositorySpy } = makeSut()

    const createSpy = jest.spyOn(createProductRepositorySpy, 'create')

    const httpRequest = {
      body: {
        name: 'valid_name',
        price: 10.01,
        category_id: 'valid_category_id'
      },
      file: {
        filename: 'valid_name'
      }
    }

    await sut.route(httpRequest)
    expect(createSpy).toHaveBeenCalledWith({
      name: httpRequest.body.name,
      price: httpRequest.body.price,
      category_id: httpRequest.body.category_id,
      imagePath: httpRequest.file.filename
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
        filename: 'valid_name'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(201)
    expect(httpResponse.body).toBe(
      'The request was successful and a new resource was created as a result.'
    )
  })
})
