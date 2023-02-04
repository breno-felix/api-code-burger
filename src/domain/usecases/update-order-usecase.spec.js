const UpdateOrderUseCase = require('./update-order-usecase')
const {
  MissingParamServerError,
  OrderNotCreatedError
} = require('../../utils/errors')

const makeSut = () => {
  const loadOrderByIdRepositorySpy = makeLoadOrderByIdRepository()
  const updateOrderRepositorySpy = makeUpdateOrderRepository()

  const sut = new UpdateOrderUseCase({
    loadOrderByIdRepository: loadOrderByIdRepositorySpy,
    updateOrderRepository: updateOrderRepositorySpy
  })

  return {
    sut,
    loadOrderByIdRepositorySpy,
    updateOrderRepositorySpy
  }
}

const makeLoadOrderByIdRepository = () => {
  class LoadOrderByIdRepositorySpy {
    async load(id) {
      this.id = id
      return this.order
    }
  }
  const loadOrderByIdRepositorySpy = new LoadOrderByIdRepositorySpy()
  loadOrderByIdRepositorySpy.order = {
    id: 'valid_id'
  }
  return loadOrderByIdRepositorySpy
}

const makeLoadOrderByIdRepositoryWithError = () => {
  class LoadOrderByIdRepositorySpy {
    async load() {
      throw new Error()
    }
  }
  return new LoadOrderByIdRepositorySpy()
}

const makeUpdateOrderRepository = () => {
  class UpdateOrderRepositorySpy {
    async update({ status, order_id }) {
      this.status = status
      this.order_id = order_id
    }
  }
  const updateOrderRepositorySpy = new UpdateOrderRepositorySpy()
  return updateOrderRepositorySpy
}

const makeUpdateOrderRepositoryWithError = () => {
  class UpdateOrderRepositorySpy {
    async update() {
      throw new Error()
    }
  }
  return new UpdateOrderRepositorySpy()
}

describe('Update Order UseCase', () => {
  test('Should throw new MissingParamServerError if no httpRequest is provided', async () => {
    const { sut } = makeSut()
    expect(sut.update()).rejects.toThrow(
      new MissingParamServerError('httpRequest')
    )
  })

  test('Should call LoadOrderByIdRepository with correct id', async () => {
    const { sut, loadOrderByIdRepositorySpy } = makeSut()

    const loadSpy = jest.spyOn(loadOrderByIdRepositorySpy, 'load')

    const httpRequest = {
      status: 'any_name',
      order_id: 'any_order_id'
    }
    await sut.update(httpRequest)
    expect(loadSpy).toHaveBeenCalledWith(httpRequest.order_id)
  })

  test('Should throw new OrderNotCreatedError if some order_id provided do not exists', async () => {
    const { sut, loadOrderByIdRepositorySpy } = makeSut()
    loadOrderByIdRepositorySpy.order = null

    const httpRequest = {
      status: 'any_name',
      order_id: 'invalid_order_id'
    }

    expect(sut.update(httpRequest)).rejects.toThrow(new OrderNotCreatedError())
  })

  test('Should call UpdateOrderRepository with correct values', async () => {
    const { sut, updateOrderRepositorySpy } = makeSut()

    const updateSpy = jest.spyOn(updateOrderRepositorySpy, 'update')

    const httpRequest = {
      status: 'valid_name',
      order_id: 'valid_order_id'
    }

    await sut.update(httpRequest)
    expect(updateSpy).toHaveBeenCalledWith(httpRequest)
  })

  test('Should throw if invalid dependencies are provided', async () => {
    const invalid = {}
    const loadOrderByIdRepository = makeLoadOrderByIdRepository()
    const suts = [].concat(
      new UpdateOrderUseCase(),
      new UpdateOrderUseCase({}),
      new UpdateOrderUseCase({
        loadOrderByIdRepository: invalid
      }),
      new UpdateOrderUseCase({
        loadOrderByIdRepository
      }),
      new UpdateOrderUseCase({
        loadOrderByIdRepository,
        updateOrderRepository: invalid
      })
    )
    const httpRequest = {
      status: 'any_name',
      order_id: 'any_order_id'
    }
    for (const sut of suts) {
      const promise = sut.update(httpRequest)
      expect(promise).rejects.toThrow()
    }
  })

  test('Should throw if dependency throw', async () => {
    const loadOrderByIdRepository = makeLoadOrderByIdRepository()
    const suts = [].concat(
      new UpdateOrderUseCase({
        loadOrderByIdRepository: makeLoadOrderByIdRepositoryWithError()
      }),
      new UpdateOrderUseCase({
        loadOrderByIdRepository,
        updateOrderRepository: makeUpdateOrderRepositoryWithError()
      })
    )
    const httpRequest = {
      status: 'any_name',
      order_id: 'any_order_id'
    }
    for (const sut of suts) {
      const promise = sut.update(httpRequest)
      expect(promise).rejects.toThrow()
    }
  })
})
