class NewOrderUseCase {
  constructor({ loadProductByIdRepository } = {}) {
    this.loadProductByIdRepository = loadProductByIdRepository
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
  }
}

const {
  MissingParamServerError,
  ProductNotCreatedError
} = require('../../utils/errors')

const makeSut = () => {
  const loadProductByIdRepositorySpy = makeLoadProductByIdRepository()

  const sut = new NewOrderUseCase({
    loadProductByIdRepository: loadProductByIdRepositorySpy
  })

  return {
    sut,
    loadProductByIdRepositorySpy
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
          product_id: 'any_id',
          quantity: 1
        },
        {
          product_id: 'some_id',
          quantity: 2
        }
      ]
    }

    expect(sut.record(httpRequest)).rejects.toThrow(
      new ProductNotCreatedError()
    )
  })
})
