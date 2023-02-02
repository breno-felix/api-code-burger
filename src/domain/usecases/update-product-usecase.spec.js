const UpdateProductUseCase = require('./update-product-usecase')
const {
  MissingParamServerError,
  CategoryNotCreatedError,
  ProductNotCreatedError,
  MissingParamError
} = require('../../utils/errors')

const makeSut = () => {
  const loadCategoryByIdRepositorySpy = makeLoadCategoryByIdRepository()
  const loadProductByIdRepositorySpy = makeLoadProductByIdRepository()
  const updateProductRepositorySpy = makeUpdateProductRepository()

  const sut = new UpdateProductUseCase({
    loadCategoryByIdRepository: loadCategoryByIdRepositorySpy,
    loadProductByIdRepository: loadProductByIdRepositorySpy,
    updateProductRepository: updateProductRepositorySpy
  })

  return {
    sut,
    loadCategoryByIdRepositorySpy,
    loadProductByIdRepositorySpy,
    updateProductRepositorySpy
  }
}

const makeLoadCategoryByIdRepository = () => {
  class LoadCategoryByIdRepositorySpy {
    async load(id) {
      this.id = id
      return this.category
    }
  }
  const loadCategoryByIdRepositorySpy = new LoadCategoryByIdRepositorySpy()
  loadCategoryByIdRepositorySpy.category = {
    id: 'valid_id'
  }
  return loadCategoryByIdRepositorySpy
}

const makeLoadCategoryByIdRepositoryWithError = () => {
  class LoadCategoryByIdRepositorySpy {
    async load() {
      throw new Error()
    }
  }
  return new LoadCategoryByIdRepositorySpy()
}

const makeLoadProductByIdRepository = () => {
  class LoadProductByIdRepositorySpy {
    async load(id) {
      this.id = id
      return this.product
    }
  }
  const loadProductByIdRepositorySpy = new LoadProductByIdRepositorySpy()
  loadProductByIdRepositorySpy.product = {
    id: 'valid_id'
  }
  return loadProductByIdRepositorySpy
}

const makeLoadProductByIdRepositoryWithError = () => {
  class LoadProductByIdRepositorySpy {
    async load() {
      throw new Error()
    }
  }
  return new LoadProductByIdRepositorySpy()
}

const makeUpdateProductRepository = () => {
  class UpdateProductRepositorySpy {
    async update({ name, price, category_id, offer, imagePath, product_id }) {
      this.name = name
      this.price = price
      this.category_id = category_id
      this.offer = offer
      this.imagePath = imagePath
      this.product_id = product_id
    }
  }
  const updateProductRepositorySpy = new UpdateProductRepositorySpy()
  return updateProductRepositorySpy
}

const makeUpdateProductRepositoryWithError = () => {
  class UpdateProductRepositorySpy {
    async update() {
      throw new Error()
    }
  }
  return new UpdateProductRepositorySpy()
}

describe('Update Product UseCase', () => {
  test('Should throw new MissingParamServerError if no httpRequest is provided', async () => {
    const { sut } = makeSut()
    expect(sut.update()).rejects.toThrow(
      new MissingParamServerError('httpRequest')
    )
  })

  test('Should throw new MissingParamError if no params is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      product_id: 'any_product_id'
    }
    expect(sut.update(httpRequest)).rejects.toThrow(
      new MissingParamError('all params')
    )
  })

  test('Should call LoadProductByIdRepository with correct id', async () => {
    const { sut, loadProductByIdRepositorySpy } = makeSut()

    const loadSpy = jest.spyOn(loadProductByIdRepositorySpy, 'load')

    const httpRequest = {
      name: 'any_name',
      price: 10.01,
      category_id: 'any_category_id',
      offer: false,
      imagePath: 'any_name',
      product_id: 'any_product_id'
    }
    await sut.update(httpRequest)
    expect(loadSpy).toHaveBeenCalledWith(httpRequest.product_id)
  })

  test('Should throw new ProductNotCreatedError if product_id provided do not exists', async () => {
    const { sut, loadProductByIdRepositorySpy } = makeSut()
    loadProductByIdRepositorySpy.product = null

    const httpRequest = {
      name: 'valid_name',
      price: 10.01,
      category_id: 'valid_category_id',
      offer: false,
      imagePath: 'valid_name',
      product_id: 'invalid_product_id'
    }

    expect(sut.update(httpRequest)).rejects.toThrow(
      new ProductNotCreatedError()
    )
  })

  test('Should call LoadCategoryByIdRepository with correct id', async () => {
    const { sut, loadCategoryByIdRepositorySpy } = makeSut()

    const loadSpy = jest.spyOn(loadCategoryByIdRepositorySpy, 'load')

    const httpRequest = {
      name: 'any_name',
      price: 10.01,
      category_id: 'any_category_id',
      offer: false,
      imagePath: 'any_name',
      product_id: 'any_product_id'
    }
    await sut.update(httpRequest)
    expect(loadSpy).toHaveBeenCalledWith(httpRequest.category_id)
  })

  test('Should throw new CategoryNotCreatedError if category_id provided do not exists', async () => {
    const { sut, loadCategoryByIdRepositorySpy } = makeSut()
    loadCategoryByIdRepositorySpy.category = null

    const httpRequest = {
      name: 'valid_name',
      price: 10.01,
      category_id: 'invalid_category_id',
      offer: false,
      imagePath: 'valid_name',
      product_id: 'any_product_id'
    }

    expect(sut.update(httpRequest)).rejects.toThrow(
      new CategoryNotCreatedError()
    )
  })

  test('Should no throw new CategoryNotCreatedError if category_id no provided', async () => {
    const { sut } = makeSut()

    const httpRequest = {
      name: 'valid_name',
      price: 10.01,
      offer: false,
      imagePath: 'valid_name',
      product_id: 'any_product_id'
    }

    expect(sut.update(httpRequest)).resolves.toBe()
  })

  test('Should call UpdateProductRepository with correct values', async () => {
    const { sut, updateProductRepositorySpy } = makeSut()

    const updateSpy = jest.spyOn(updateProductRepositorySpy, 'update')

    const httpRequest = {
      name: 'valid_name',
      price: 10.01,
      category_id: 'valid_category_id',
      offer: false,
      imagePath: 'valid_name',
      product_id: 'valid_product_id'
    }

    await sut.update(httpRequest)
    expect(updateSpy).toHaveBeenCalledWith(httpRequest)
  })

  test('Should throw if invalid dependencies are provided', async () => {
    const invalid = {}
    const loadCategoryByIdRepository = makeLoadCategoryByIdRepository()
    const loadProductByIdRepository = makeLoadProductByIdRepository()
    const suts = [].concat(
      new UpdateProductUseCase(),
      new UpdateProductUseCase({}),
      new UpdateProductUseCase({
        loadUserByEmailRepository: invalid
      }),
      new UpdateProductUseCase({
        loadCategoryByIdRepository
      }),
      new UpdateProductUseCase({
        loadCategoryByIdRepository,
        loadProductByIdRepository: invalid
      }),
      new UpdateProductUseCase({
        loadCategoryByIdRepository,
        loadProductByIdRepository
      }),
      new UpdateProductUseCase({
        loadCategoryByIdRepository,
        loadProductByIdRepository,
        updateProductRepositorySpy: invalid
      })
    )
    const httpRequest = {
      name: 'any_name',
      price: 10.01,
      category_id: 'any_category_id',
      offer: false,
      imagePath: 'any_name',
      product_id: 'any_product_id'
    }
    for (const sut of suts) {
      const promise = sut.update(httpRequest)
      expect(promise).rejects.toThrow()
    }
  })

  test('Should throw if dependency throw', async () => {
    const loadCategoryByIdRepository = makeLoadCategoryByIdRepository()
    const loadProductByIdRepository = makeLoadProductByIdRepository()
    const suts = [].concat(
      new UpdateProductUseCase({
        loadCategoryByIdRepository: makeLoadCategoryByIdRepositoryWithError()
      }),
      new UpdateProductUseCase({
        loadCategoryByIdRepository,
        loadProductByIdRepository: makeLoadProductByIdRepositoryWithError()
      }),
      new UpdateProductUseCase({
        loadCategoryByIdRepository,
        loadProductByIdRepository,
        updateProductRepositorySpy: makeUpdateProductRepositoryWithError
      })
    )
    const httpRequest = {
      name: 'any_name',
      price: 10.01,
      category_id: 'any_category_id',
      offer: false,
      imagePath: 'any_name',
      product_id: 'any_product_id'
    }
    for (const sut of suts) {
      const promise = sut.update(httpRequest)
      expect(promise).rejects.toThrow()
    }
  })
})
