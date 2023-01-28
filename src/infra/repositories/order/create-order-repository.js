const { MissingParamServerError } = require('../../../utils/errors')
module.exports = class CreateOrderRepository {
  constructor(orderModel) {
    this.orderModel = orderModel
  }

  async create(orderObject) {
    if (!orderObject) {
      throw new MissingParamServerError('orderObject')
    }
    return await this.orderModel.create(orderObject)
  }
}
