const { MissingParamServerError } = require('../../../utils/errors')
module.exports = class UpdateOrderRepository {
  constructor(orderModel) {
    this.orderModel = orderModel
  }

  async update(orderObject) {
    if (!orderObject) {
      throw new MissingParamServerError('orderObject')
    }
    const { status, order_id } = orderObject
    return await this.orderModel.updateOne({ _id: order_id }, { status })
  }
}
