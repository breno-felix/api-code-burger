class NewProductUseCase {
  constructor({ loadCategoryByIdRepository, createProductRepository } = {}) {
    this.loadCategoryByIdRepository = loadCategoryByIdRepository
    this.createProductRepository = createProductRepository
  }

  async record(httpRequest) {
    if (!httpRequest) {
      throw new MissingParamServerError('httpRequest')
    }

    const category = await this.loadCategoryByIdRepository.load(
      httpRequest.category_id
    )

    if (!category) {
      throw new CategoryNotCreatedError()
    }

    await this.createProductRepository.create(httpRequest)
  }
}

const {
  MissingParamServerError,
  CategoryNotCreatedError
} = require('../../utils/errors')

const makeSut = () => {
  const loadCategoryByIdRepositorySpy = makeLoadCategoryByIdRepository()
  const createProductRepositorySpy = makeCreateProductRepository()

  const sut = new NewProductUseCase({
    loadCategoryByIdRepository: loadCategoryByIdRepositorySpy,
    createProductRepository: createProductRepositorySpy
  })

  return {
    sut,
    loadCategoryByIdRepositorySpy,
    createProductRepositorySpy
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

const makeCreateProductRepository = () => {
  class CreateProductRepositorySpy {
    async create({ name, price, category_id, imagePath }) {
      this.name = name
      this.price = price
      this.category_id = category_id
      this.imagePath = imagePath
    }
  }
  const createProductRepositorySpy = new CreateProductRepositorySpy()
  return createProductRepositorySpy
}

describe('New Product UseCase', () => {
  test('Should throw new MissingParamServerError if no httpRequest is provided', async () => {
    const { sut } = makeSut()
    expect(sut.record()).rejects.toThrow(
      new MissingParamServerError('httpRequest')
    )
  })

  test('Should call LoadCategoryByIdRepository with correct id', async () => {
    const { sut, loadCategoryByIdRepositorySpy } = makeSut()

    const loadSpy = jest.spyOn(loadCategoryByIdRepositorySpy, 'load')

    const httpRequest = {
      name: 'any_name',
      price: 10.01,
      category_id: 'any_category_id',
      imagePath: 'any_name'
    }
    await sut.record(httpRequest)
    expect(loadSpy).toHaveBeenCalledWith(httpRequest.category_id)
  })

  test('Should throw new CategoryNotCreatedError if category_id provided do not exists', async () => {
    const { sut, loadCategoryByIdRepositorySpy } = makeSut()
    loadCategoryByIdRepositorySpy.category = null

    const httpRequest = {
      name: 'valid_name',
      price: 10.01,
      category_id: 'invalid_category_id',
      imagePath: 'valid_name'
    }

    expect(sut.record(httpRequest)).rejects.toThrow(
      new CategoryNotCreatedError()
    )
  })

  test('Should call CreateProductRepository with correct values', async () => {
    const { sut, createProductRepositorySpy } = makeSut()

    const createSpy = jest.spyOn(createProductRepositorySpy, 'create')

    const httpRequest = {
      name: 'valid_name',
      price: 10.01,
      category_id: 'invalid_category_id',
      imagePath: 'valid_name'
    }

    await sut.record(httpRequest)
    expect(createSpy).toHaveBeenCalledWith(httpRequest)
  })
})
