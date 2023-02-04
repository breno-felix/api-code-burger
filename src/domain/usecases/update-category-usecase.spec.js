const UpdateCategoryUseCase = require('./update-category-usecase')
const {
  MissingParamServerError,
  RepeatedNameError,
  CategoryNotCreatedError,
  MissingParamError
} = require('../../utils/errors')

const makeSut = () => {
  const loadCategoryByNameRepositorySpy = makeLoadCategoryByNameRepository()
  const loadCategoryByIdRepositorySpy = makeLoadCategoryByIdRepository()
  const updateCategoryRepositorySpy = makeUpdateCategoryRepository()

  const sut = new UpdateCategoryUseCase({
    loadCategoryByNameRepository: loadCategoryByNameRepositorySpy,
    loadCategoryByIdRepository: loadCategoryByIdRepositorySpy,
    updateCategoryRepository: updateCategoryRepositorySpy
  })

  return {
    sut,
    loadCategoryByNameRepositorySpy,
    loadCategoryByIdRepositorySpy,
    updateCategoryRepositorySpy
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

const makeLoadCategoryByNameRepositoryWithError = () => {
  class LoadCategoryByNameRepositorySpy {
    async load() {
      throw new Error()
    }
  }
  return new LoadCategoryByNameRepositorySpy()
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

const makeUpdateCategoryRepository = () => {
  class UpdateCategoryRepositorySpy {
    async update({ name, imagePath, category_id }) {
      this.name = name
      this.imagePath = imagePath
      this.category_id = category_id
    }
  }
  const updateCategoryRepositorySpy = new UpdateCategoryRepositorySpy()
  return updateCategoryRepositorySpy
}

const makeUpdateCategoryRepositoryWithError = () => {
  class UpdateCategoryRepositorySpy {
    async update() {
      throw new Error()
    }
  }
  return new UpdateCategoryRepositorySpy()
}

describe('Update Category UseCase', () => {
  test('Should throw new MissingParamServerError if no httpRequest is provided', async () => {
    const { sut } = makeSut()
    expect(sut.update()).rejects.toThrow(
      new MissingParamServerError('httpRequest')
    )
  })

  test('Should throw new MissingParamError if no params is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      category_id: 'any_category_id'
    }
    expect(sut.update(httpRequest)).rejects.toThrow(
      new MissingParamError('all params')
    )
  })

  test('Should call LoadCategoryByIdRepository with correct id', async () => {
    const { sut, loadCategoryByIdRepositorySpy } = makeSut()

    const loadSpy = jest.spyOn(loadCategoryByIdRepositorySpy, 'load')

    const httpRequest = {
      name: 'any_name',
      imagePath: 'any_name',
      category_id: 'any_category_id'
    }
    await sut.update(httpRequest)
    expect(loadSpy).toHaveBeenCalledWith(httpRequest.category_id)
  })

  test('Should throw new CategoryNotCreatedError if category_id provided do not exists', async () => {
    const { sut, loadCategoryByIdRepositorySpy } = makeSut()
    loadCategoryByIdRepositorySpy.category = null

    const httpRequest = {
      name: 'valid_name',
      imagePath: 'valid_name',
      category_id: 'invalid_category_id'
    }

    expect(sut.update(httpRequest)).rejects.toThrow(
      new CategoryNotCreatedError()
    )
  })

  test('Should call LoadCategoryByNameRepository with correct name', async () => {
    const { sut, loadCategoryByNameRepositorySpy } = makeSut()

    const loadSpy = jest.spyOn(loadCategoryByNameRepositorySpy, 'load')

    const httpRequest = {
      name: 'any_name',
      imagePath: 'any_name',
      category_id: 'any_category_id'
    }
    await sut.update(httpRequest)
    expect(loadSpy).toHaveBeenCalledWith(httpRequest.name)
  })

  test('Should throw new RepeatedNameError if name provided already exists', async () => {
    const { sut, loadCategoryByNameRepositorySpy } = makeSut()
    loadCategoryByNameRepositorySpy.category = {
      id: 'any_id'
    }
    const httpRequest = {
      name: 'invalid_name',
      imagePath: 'any_name',
      category_id: 'any_category_id'
    }

    expect(sut.update(httpRequest)).rejects.toThrow(new RepeatedNameError())
  })

  test('Should no throw new RepeatedNameError if name no provided', async () => {
    const { sut } = makeSut()

    const httpRequest = {
      imagePath: 'valid_name',
      category_id: 'any_category_id'
    }

    expect(sut.update(httpRequest)).resolves.toBe()
  })

  test('Should call UpdateCategoryRepository with correct values', async () => {
    const { sut, updateCategoryRepositorySpy } = makeSut()

    const updateSpy = jest.spyOn(updateCategoryRepositorySpy, 'update')

    const httpRequest = {
      name: 'valid_name',
      imagePath: 'valid_name',
      category_id: 'valid_category_id'
    }

    await sut.update(httpRequest)
    expect(updateSpy).toHaveBeenCalledWith(httpRequest)
  })

  test('Should throw if invalid dependencies are provided', async () => {
    const invalid = {}
    const loadCategoryByNameRepository = makeLoadCategoryByNameRepository()
    const loadCategoryByIdRepository = makeLoadCategoryByIdRepository()
    const suts = [].concat(
      new UpdateCategoryUseCase(),
      new UpdateCategoryUseCase({}),
      new UpdateCategoryUseCase({
        loadCategoryByNameRepository: invalid
      }),
      new UpdateCategoryUseCase({
        loadCategoryByNameRepository
      }),
      new UpdateCategoryUseCase({
        loadCategoryByNameRepository,
        loadCategoryByIdRepository: invalid
      }),
      new UpdateCategoryUseCase({
        loadCategoryByNameRepository,
        loadCategoryByIdRepository
      }),
      new UpdateCategoryUseCase({
        loadCategoryByNameRepository,
        loadCategoryByIdRepository,
        updateCategoryRepository: invalid
      })
    )
    const httpRequest = {
      name: 'any_name',
      imagePath: 'any_name',
      category_id: 'any_category_id'
    }
    for (const sut of suts) {
      const promise = sut.update(httpRequest)
      expect(promise).rejects.toThrow()
    }
  })

  test('Should throw if dependency throw', async () => {
    const loadCategoryByNameRepository = makeLoadCategoryByNameRepository()
    const loadCategoryByIdRepository = makeLoadCategoryByIdRepository()
    const suts = [].concat(
      new UpdateCategoryUseCase({
        loadCategoryByNameRepository:
          makeLoadCategoryByNameRepositoryWithError()
      }),
      new UpdateCategoryUseCase({
        loadCategoryByNameRepository,
        loadCategoryByIdRepository: makeLoadCategoryByIdRepositoryWithError()
      }),
      new UpdateCategoryUseCase({
        loadCategoryByNameRepository,
        loadCategoryByIdRepository,
        updateCategoryRepository: makeUpdateCategoryRepositoryWithError()
      })
    )
    const httpRequest = {
      name: 'any_name',
      imagePath: 'any_name',
      category_id: 'any_category_id'
    }
    for (const sut of suts) {
      const promise = sut.update(httpRequest)
      expect(promise).rejects.toThrow()
    }
  })
})
