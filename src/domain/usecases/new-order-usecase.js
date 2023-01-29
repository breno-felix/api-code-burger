const {
  MissingParamServerError,
  ProductNotCreatedError,
  InvalidParamError
} = require('../../utils/errors')
const MongooseHelper = require('../../infra/helpers/mongoose-helper')

module.exports = class NewOrderUseCase {
  constructor({ loadProductByIdRepository, createOrderRepository } = {}) {
    this.loadProductByIdRepository = loadProductByIdRepository
    this.createOrderRepository = createOrderRepository
  }

  async record(httpRequest) {
    if (!httpRequest) {
      throw new MissingParamServerError('httpRequest')
    }
    try {
      for (let i = 0; i < httpRequest.products.length; i++) {
        const product = await this.loadProductByIdRepository.load(
          httpRequest.products[i].product_id
        )
        if (!product) {
          throw new ProductNotCreatedError()
        }
      }
      await this.createOrderRepository.create(httpRequest)
    } catch (error) {
      if (error instanceof MongooseHelper.getTypeOfError()) {
        throw new InvalidParamError(error)
      }
      throw error
    }
  }
}
