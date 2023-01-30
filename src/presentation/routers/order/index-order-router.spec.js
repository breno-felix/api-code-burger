const IndexOrderRouter = require('./index-order-router')
const { ServerError } = require('../../errors')

const makeSut = () => {
  const loadAllOrderRepositorySpy = makeLoadAllOrderRepository()

  const sut = new IndexOrderRouter({
    loadAllOrderRepository: loadAllOrderRepositorySpy
  })

  return {
    sut,
    loadAllOrderRepositorySpy
  }
}

const makeLoadAllOrderRepository = () => {
  class LoadAllOrderRepositorySpy {
    async load() {
      return this.orders
    }
  }
  const loadAllOrderRepositorySpy = new LoadAllOrderRepositorySpy()
  loadAllOrderRepositorySpy.orders = [{ id: 'any_id' }, { id: 'some_id' }]
  return loadAllOrderRepositorySpy
}

const makeLoadAllOrderRepositoryWithError = () => {
  class LoadAllOrderRepositorySpy {
    async load() {
      throw new Error()
    }
  }
  return new LoadAllOrderRepositorySpy()
}

describe('Index Order Router', () => {
  test('Should return 200 and orders if loadAllOrderRepository returns orders and no errors', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.route()
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body).toStrictEqual([
      { id: 'any_id' },
      { id: 'some_id' }
    ])
  })

  test('Should return 200 and empty array if loadAllOrderRepository returns empty array and no errors', async () => {
    const { sut, loadAllOrderRepositorySpy } = makeSut()
    loadAllOrderRepositorySpy.orders = []
    const httpResponse = await sut.route()
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body).toStrictEqual([])
  })

  test('Should return 500 if invalid dependency is provided', async () => {
    const invalid = {}
    const suts = [].concat(
      new IndexOrderRouter(),
      new IndexOrderRouter({}),
      new IndexOrderRouter({
        loadAllOrderRepository: invalid
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
      new IndexOrderRouter({
        loadAllOrderRepository: makeLoadAllOrderRepositoryWithError()
      })
    )
    for (const sut of suts) {
      const httpResponse = await sut.route()
      expect(httpResponse.statusCode).toBe(500)
      expect(httpResponse.body.error).toBe(new ServerError().message)
    }
  })
})
