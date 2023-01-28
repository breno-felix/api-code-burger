class NewOrderUseCase {
  constructor({ loadProductByIdRepository, createOrderRepository } = {}) {
    this.loadProductByIdRepository = loadProductByIdRepository
    this.createOrderRepository = createOrderRepository
  }

  async record(httpRequest) {
    if (!httpRequest) {
      throw new MissingParamServerError('httpRequest')
    }

    for (let i = 0; i < httpRequest.products.length; i++) {
      const product = await this.loadProductByIdRepository.load(
        httpRequest.products[i].product_id
      )
      if (!product) {
        throw new ProductNotCreatedError()
      }
    }

    await this.createOrderRepository.create(httpRequest)
  }
}

const {
  MissingParamServerError,
  ProductNotCreatedError
} = require('../../utils/errors')

const makeSut = () => {
  const loadProductByIdRepositorySpy = makeLoadProductByIdRepository()
  const createOrderRepositorySpy = makeCreateOrderRepository()

  const sut = new NewOrderUseCase({
    loadProductByIdRepository: loadProductByIdRepositorySpy,
    createOrderRepository: createOrderRepositorySpy
  })

  return {
    sut,
    loadProductByIdRepositorySpy,
    createOrderRepositorySpy
  }
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

const makeCreateOrderRepository = () => {
  class CreateOrderRepositorySpy {
    async create({ user_id, products }) {
      this.user_id = user_id
      this.products = products
    }
  }
  const createOrderRepositorySpy = new CreateOrderRepositorySpy()
  return createOrderRepositorySpy
}

describe('New Order UseCase', () => {
  test('Should throw new MissingParamServerError if no httpRequest is provided', async () => {
    const { sut } = makeSut()
    expect(sut.record()).rejects.toThrow(
      new MissingParamServerError('httpRequest')
    )
  })

  test('Should call LoadProductByIdRepository with correct id', async () => {
    const { sut, loadProductByIdRepositorySpy } = makeSut()

    const loadSpy = jest.spyOn(loadProductByIdRepositorySpy, 'load')

    const httpRequest = {
      userId: 'any_user_id',
      products: [
        {
          product_id: 'any_id',
          quantity: 1
        },
        {
          product_id: 'some_id',
          quantity: 2
        }
      ]
    }
    await sut.record(httpRequest)
    expect(loadSpy).toHaveBeenCalledTimes(2)
    expect(loadSpy).toHaveBeenNthCalledWith(
      1,
      httpRequest.products[0].product_id
    )
    expect(loadSpy).toHaveBeenNthCalledWith(
      2,
      httpRequest.products[1].product_id
    )
  })

  test('Should throw new ProductNotCreatedError if some product_id provided do not exists', async () => {
    const { sut, loadProductByIdRepositorySpy } = makeSut()
    loadProductByIdRepositorySpy.product = null

    const httpRequest = {
      userId: 'any_user_id',
      products: [
        {
          product_id: 'invalid_id',
          quantity: 1
        },
        {
          product_id: 'invalid_id',
          quantity: 2
        }
      ]
    }

    expect(sut.record(httpRequest)).rejects.toThrow(
      new ProductNotCreatedError()
    )
  })

  test('Should call CreateOrderRepository with correct values', async () => {
    const { sut, createOrderRepositorySpy } = makeSut()

    const createSpy = jest.spyOn(createOrderRepositorySpy, 'create')

    const httpRequest = {
      userId: 'any_user_id',
      products: [
        {
          product_id: 'any_id',
          quantity: 1
        },
        {
          product_id: 'some_id',
          quantity: 2
        }
      ]
    }

    await sut.record(httpRequest)
    expect(createSpy).toHaveBeenCalledWith(httpRequest)
  })

  test('Should throw if invalid dependencies are provided', async () => {
    const invalid = {}
    const loadProductByIdRepository = makeLoadProductByIdRepository()
    const suts = [].concat(
      new NewOrderUseCase(),
      new NewOrderUseCase({}),
      new NewOrderUseCase({
        loadProductByIdRepository: invalid
      }),
      new NewOrderUseCase({
        loadProductByIdRepository
      }),
      new NewOrderUseCase({
        loadProductByIdRepository,
        createOrderRepository: invalid
      })
    )
    const httpRequest = {
      userId: 'any_user_id',
      products: [
        {
          product_id: 'any_id',
          quantity: 1
        },
        {
          product_id: 'some_id',
          quantity: 2
        }
      ]
    }
    for (const sut of suts) {
      const promise = sut.record(httpRequest)
      expect(promise).rejects.toThrow()
    }
  })
})
