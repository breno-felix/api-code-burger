class NewCategoryUseCase {
  constructor({ loadCategoryByNameRepository, createCategoryRepository } = {}) {
    this.loadCategoryByNameRepository = loadCategoryByNameRepository
    this.createCategoryRepository = createCategoryRepository
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

    await this.createCategoryRepository.create({
      name: httpRequest.name
    })
  }
}

const {
  MissingParamServerError,
  RepeatedNameError
} = require('../../utils/errors')

const makeSut = () => {
  const loadCategoryByNameRepositorySpy = makeLoadCategoryByNameRepository()
  const createCategoryRepositorySpy = makeCreateCategoryRepository()

  const sut = new NewCategoryUseCase({
    loadCategoryByNameRepository: loadCategoryByNameRepositorySpy,
    createCategoryRepository: createCategoryRepositorySpy
  })

  return {
    sut,
    loadCategoryByNameRepositorySpy,
    createCategoryRepositorySpy
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

const makeCreateCategoryRepository = () => {
  class CreateCategoryRepositorySpy {
    async create({ name, email, password, admin }) {
      this.name = name
      this.email = email
      this.password = password
      this.admin = admin
    }
  }
  const createCategoryRepositorySpy = new CreateCategoryRepositorySpy()
  return createCategoryRepositorySpy
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

  test('Should call CreateCategoryRepository with correct values', async () => {
    const { sut, createCategoryRepositorySpy } = makeSut()

    const validateSyncSpy = jest.spyOn(createCategoryRepositorySpy, 'create')

    const httpRequest = {
      body: {
        name: 'valid_name'
      }
    }

    await sut.record(httpRequest.body)
    expect(validateSyncSpy).toHaveBeenCalledWith({
      name: httpRequest.body.name
    })
  })
})
