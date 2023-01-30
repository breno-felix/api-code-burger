const IndexProductRouter = require('./index-product-router')
const { ServerError } = require('../../errors')

const makeSut = () => {
  const loadAllProductRepositorySpy = makeLoadAllProductRepository()

  const sut = new IndexProductRouter({
    loadAllProductRepository: loadAllProductRepositorySpy
  })

  return {
    sut,
    loadAllProductRepositorySpy
  }
}

const makeLoadAllProductRepository = () => {
  class LoadAllProductRepositorySpy {
    async load() {
      return this.products
    }
  }
  const loadAllProductRepositorySpy = new LoadAllProductRepositorySpy()
  loadAllProductRepositorySpy.products = [{ id: 'any_id' }, { id: 'some_id' }]
  return loadAllProductRepositorySpy
}

const makeLoadAllProductRepositoryWithError = () => {
  class LoadAllProductRepositorySpy {
    async load() {
      throw new Error()
    }
  }
  return new LoadAllProductRepositorySpy()
}

describe('Index Product Router', () => {
  test('Should return 200 and products if loadAllProductRepository returns products and no errors', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.route()
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body).toStrictEqual([
      { id: 'any_id' },
      { id: 'some_id' }
    ])
  })

  test('Should return 200 and empty array if loadAllProductRepository returns empty array and no errors', async () => {
    const { sut, loadAllProductRepositorySpy } = makeSut()
    loadAllProductRepositorySpy.products = []
    const httpResponse = await sut.route()
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body).toStrictEqual([])
  })

  test('Should return 500 if invalid dependency is provided', async () => {
    const invalid = {}
    const suts = [].concat(
      new IndexProductRouter(),
      new IndexProductRouter({}),
      new IndexProductRouter({
        loadAllProductRepository: invalid
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
      new IndexProductRouter({
        loadAllProductRepository: makeLoadAllProductRepositoryWithError()
      })
    )
    for (const sut of suts) {
      const httpResponse = await sut.route()
      expect(httpResponse.statusCode).toBe(500)
      expect(httpResponse.body.error).toBe(new ServerError().message)
    }
  })
})
