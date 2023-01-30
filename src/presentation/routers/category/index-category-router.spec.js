const IndexCategoryRouter = require('./index-category-router')
const { ServerError } = require('../../errors')

const makeSut = () => {
  const loadAllCategoryRepositorySpy = makeLoadAllCategoryRepository()

  const sut = new IndexCategoryRouter({
    loadAllCategoryRepository: loadAllCategoryRepositorySpy
  })

  return {
    sut,
    loadAllCategoryRepositorySpy
  }
}

const makeLoadAllCategoryRepository = () => {
  class LoadAllCategoryRepositorySpy {
    async load() {
      return this.categories
    }
  }
  const loadAllCategoryRepositorySpy = new LoadAllCategoryRepositorySpy()
  loadAllCategoryRepositorySpy.categories = [
    { id: 'any_id' },
    { id: 'some_id' }
  ]
  return loadAllCategoryRepositorySpy
}

const makeLoadAllCategoryRepositoryWithError = () => {
  class LoadAllCategoryRepositorySpy {
    async load() {
      throw new Error()
    }
  }
  return new LoadAllCategoryRepositorySpy()
}

describe('Index Category Router', () => {
  test('Should return 200 and categories if loadAllCategoryRepository returns categories and no errors', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.route()
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body).toStrictEqual([
      { id: 'any_id' },
      { id: 'some_id' }
    ])
  })

  test('Should return 200 and empty array if loadAllCategoryRepository returns empty array and no errors', async () => {
    const { sut, loadAllCategoryRepositorySpy } = makeSut()
    loadAllCategoryRepositorySpy.categories = []
    const httpResponse = await sut.route()
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body).toStrictEqual([])
  })

  test('Should return 500 if invalid dependency is provided', async () => {
    const invalid = {}
    const suts = [].concat(
      new IndexCategoryRouter(),
      new IndexCategoryRouter({}),
      new IndexCategoryRouter({
        loadAllCategoryRepository: invalid
      })
    )
    for (const sut of suts) {
      const httpResponse = await sut.route()
      expect(httpResponse.statusCode).toBe(500)
      expect(httpResponse.body.error).toBe(new ServerError().message)
    }
  })

  test('Should return 500 if any dependency throw a new Error()', async () => {
    const suts = [].concat(
      new IndexCategoryRouter({
        loadAllCategoryRepository: makeLoadAllCategoryRepositoryWithError()
      })
    )
    for (const sut of suts) {
      const httpResponse = await sut.route()
      expect(httpResponse.statusCode).toBe(500)
      expect(httpResponse.body.error).toBe(new ServerError().message)
    }
  })
})
