class NewCategoryUseCase {
  constructor({ loadCategoryByNameRepository } = {}) {
    this.loadCategoryByNameRepository = loadCategoryByNameRepository
  }

  async record(httpRequest) {
    if (!httpRequest) {
      throw new MissingParamServerError('httpRequest')
    }

    const category = await this.loadCategoryByNameRepository.load(
      httpRequest.name
    )

    if (category) {
      throw new RepeatedNameError()
    }
  }
}

const {
  MissingParamServerError,
  RepeatedNameError
} = require('../../utils/errors')

const makeSut = () => {
  const loadCategoryByNameRepositorySpy = makeLoadCategoryByNameRepository()

  const sut = new NewCategoryUseCase({
    loadCategoryByNameRepository: loadCategoryByNameRepositorySpy
  })

  return {
    sut,
    loadCategoryByNameRepositorySpy
  }
}

const makeLoadCategoryByNameRepository = () => {
  class LoadCategoryByNameRepositorySpy {
    async load(name) {
      this.name = name
      return this.category
    }
  }
  const loadCategoryByNameRepositorySpy = new LoadCategoryByNameRepositorySpy()
  loadCategoryByNameRepositorySpy.category = null
  return loadCategoryByNameRepositorySpy
}

describe('Sign up UseCase', () => {
  test('Should throw new MissingParamServerError if no httpRequest is provided', async () => {
    const { sut } = makeSut()
    expect(sut.record()).rejects.toThrow(
      new MissingParamServerError('httpRequest')
    )
  })

  test('Should call LoadCategoryByNameRepository with correct name', async () => {
    const { sut, loadCategoryByNameRepositorySpy } = makeSut()

    const validateSyncSpy = jest.spyOn(loadCategoryByNameRepositorySpy, 'load')

    const httpRequest = {
      body: {
        name: 'any_name'
      }
    }
    await sut.record(httpRequest.body)
    expect(validateSyncSpy).toHaveBeenCalledWith(httpRequest.body.name)
  })

  test('Should throw new RepeatedNameError if name provided already exists', async () => {
    const { sut, loadCategoryByNameRepositorySpy } = makeSut()
    loadCategoryByNameRepositorySpy.category = {
      id: 'any_id'
    }
    const httpRequest = {
      body: {
        name: 'any_name'
      }
    }

    expect(sut.record(httpRequest.body)).rejects.toThrow(
      new RepeatedNameError()
    )
  })
})
