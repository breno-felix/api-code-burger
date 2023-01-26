class NewProductUseCase {
  constructor({ loadCategoryByIdRepository } = {}) {
    this.loadCategoryByIdRepository = loadCategoryByIdRepository
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
  }
}

const {
  MissingParamServerError,
  CategoryNotCreatedError
} = require('../../utils/errors')

const makeSut = () => {
  const loadCategoryByIdRepositorySpy = makeLoadCategoryByIdRepository()

  const sut = new NewProductUseCase({
    loadCategoryByIdRepository: loadCategoryByIdRepositorySpy
  })

  return {
    sut,
    loadCategoryByIdRepositorySpy
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
})
