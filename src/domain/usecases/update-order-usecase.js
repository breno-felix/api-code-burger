const {
  MissingParamServerError,
  OrderNotCreatedError
} = require('../../utils/errors')

module.exports = class UpdateOrderUseCase {
  constructor({ loadOrderByIdRepository, updateOrderRepository } = {}) {
    this.loadOrderByIdRepository = loadOrderByIdRepository
    this.updateOrderRepository = updateOrderRepository
  }

  async update(httpRequest) {
    if (!httpRequest) {
      throw new MissingParamServerError('httpRequest')
    }

    const order = await this.loadOrderByIdRepository.load(httpRequest.order_id)
    if (!order) {
      throw new OrderNotCreatedError()
    }

    await this.updateOrderRepository.update(httpRequest)
  }
}
