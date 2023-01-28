const {
  MissingParamServerError,
  ProductNotCreatedError
} = require('../../utils/errors')

module.exports = class NewOrderUseCase {
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
