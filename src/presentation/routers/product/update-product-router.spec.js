const UpdateProductRouter = require('./update-product-router')
const { ServerError } = require('../../errors')
const {
  MissingParamError,
  InvalidParamError,
  CategoryNotCreatedError,
  ProductNotCreatedError
} = require('../../../utils/errors')

const makeSut = () => {
  const objectShapeValidatorSpy = makeObjectShapeValidator()
  const updateProductUseCaseSpy = makeUpdateProductUseCase()

  const sut = new UpdateProductRouter({
    objectShapeValidator: objectShapeValidatorSpy,
    updateProductUseCase: updateProductUseCaseSpy
  })

  return {
    sut,
    objectShapeValidatorSpy,
    updateProductUseCaseSpy
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

const makeUpdateProductUseCase = () => {
  class UpdateProductUseCaseSpy {
    async update({ name, price, category_id, offer, imagePath, product_id }) {
      this.name = name
      this.email = price
      this.category_id = category_id
      this.offer = offer
      this.imagePath = imagePath
      this.product_id = product_id
    }
  }
  const updateProductUseCaseSpy = new UpdateProductUseCaseSpy()
  return updateProductUseCaseSpy
}

const makeUpdateProductUseCaseWithCategoryNotCreatedError = () => {
  class UpdateProductUseCaseSpy {
    async update() {
      throw new CategoryNotCreatedError()
    }
  }
  return new UpdateProductUseCaseSpy()
}

const makeUpdateProductUseCaseWithProductNotCreatedError = () => {
  class UpdateProductUseCaseSpy {
    async update() {
      throw new ProductNotCreatedError()
    }
  }
  return new UpdateProductUseCaseSpy()
}

const makeUpdateProductUseCaseWithMissingParamError = () => {
  class UpdateProductUseCaseSpy {
    async update() {
      throw new MissingParamError('all params')
    }
  }
  return new UpdateProductUseCaseSpy()
}

const makeUpdateProductUseCaseWithError = () => {
  class UpdateProductUseCaseSpy {
    async update() {
      throw new Error()
    }
  }
  return new UpdateProductUseCaseSpy()
}

const invalidRequests = [undefined, {}]

describe('Update Product Router', () => {
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
        category_id: 'any_category_id',
        offer: false
      },
      file: {
        key: 'any_name'
      },
      params: {
        product_id: 'any_product_id'
      }
    }
    await sut.route(httpRequest)
    expect(objectShapeValidatorSpy.httpRequest).toBe(httpRequest.body)
  })

  test('Should return 400 if an invalid param is provided', async () => {
    const sut = new UpdateProductRouter({
      objectShapeValidator: makeObjectShapeValidatorWithInvalidParamError()
    })

    const httpRequest = {
      body: {
        name: 'invalid_name',
        price: 'invalid_price',
        category_id: 'invalid_category_id',
        offer: 'anything_other_than_boolean'
      },
      file: {
        key: 'any_name'
      },
      params: {
        product_id: 'any_product_id'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
  })

  test('Should call updateProductUseCase with correct values', async () => {
    const { sut, updateProductUseCaseSpy } = makeSut()

    const updateSpy = jest.spyOn(updateProductUseCaseSpy, 'update')

    const httpRequest = {
      body: {
        name: 'valid_name',
        price: 10.01,
        category_id: 'any_category_id'
      },
      file: {
        key: 'valid_name'
      },
      params: {
        product_id: 'any_product_id'
      }
    }

    await sut.route(httpRequest)
    expect(updateSpy).toHaveBeenCalledWith({
      name: httpRequest.body.name,
      price: httpRequest.body.price,
      category_id: httpRequest.body.category_id,
      imagePath: httpRequest.file.key,
      product_id: httpRequest.params.product_id
    })
  })

  test('Should return 204 when valid params are provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'valid_name',
        price: 10.01,
        category_id: 'valid_category_id'
      },
      file: {
        key: 'valid_name'
      },
      params: {
        product_id: 'valid_product_id'
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
        name: 'valid_name',
        price: 10.01,
        category_id: 'valid_category_id'
      },
      params: {
        product_id: 'valid_product_id'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(204)
    expect(httpResponse.body).toBe(
      'The request was successfully processed but is not returning any content.'
    )
  })

  test('Should return 400 when category_id does not exist in category database', async () => {
    const objectShapeValidator = makeObjectShapeValidator()

    const sut = new UpdateProductRouter({
      updateProductUseCase:
        makeUpdateProductUseCaseWithCategoryNotCreatedError(),
      objectShapeValidator
    })

    const httpRequest = {
      body: {
        name: 'valid_name',
        price: 10.01,
        category_id: 'invalid_category_id'
      },
      file: {
        key: 'valid_name'
      },
      params: {
        product_id: 'valid_product_id'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body.error).toBe(new CategoryNotCreatedError().message)
  })

  test('Should return 400 when product_id does not exist in product database', async () => {
    const objectShapeValidator = makeObjectShapeValidator()

    const sut = new UpdateProductRouter({
      updateProductUseCase:
        makeUpdateProductUseCaseWithProductNotCreatedError(),
      objectShapeValidator
    })

    const httpRequest = {
      body: {
        name: 'valid_name',
        price: 10.01,
        category_id: 'valid_category_id'
      },
      file: {
        key: 'valid_name'
      },
      params: {
        product_id: 'invalid_product_id'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body.error).toBe(new ProductNotCreatedError().message)
  })

  test('Should return 400 when no params is provided', async () => {
    const objectShapeValidator = makeObjectShapeValidator()

    const sut = new UpdateProductRouter({
      updateProductUseCase: makeUpdateProductUseCaseWithMissingParamError(),
      objectShapeValidator
    })

    const httpRequest = {
      body: {},
      params: {
        product_id: 'invalid_product_id'
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
      new UpdateProductRouter(),
      new UpdateProductRouter({}),
      new UpdateProductRouter({
        objectShapeValidator: invalid
      }),
      new UpdateProductRouter({
        objectShapeValidator
      }),
      new UpdateProductRouter({
        objectShapeValidator,
        updateProductUseCase: invalid
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
        },
        params: {
          product_id: 'any_product_id'
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
      new UpdateProductRouter({
        objectShapeValidator: makeObjectShapeValidatorWithError()
      }),
      new UpdateProductRouter({
        objectShapeValidator,
        updateProductUseCase: makeUpdateProductUseCaseWithError()
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
        },
        params: {
          product_id: 'any_product_id'
        }
      }
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(500)
      expect(httpResponse.body.error).toBe(new ServerError().message)
    }
  })
})
