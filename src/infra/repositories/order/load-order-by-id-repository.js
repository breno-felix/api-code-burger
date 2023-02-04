const {
  MissingParamServerError,
  InvalidParamError
} = require('../../../utils/errors')
const MongooseHelper = require('../../helpers/mongoose-helper')

module.exports = class LoadOrderByIdRepository {
  constructor(orderModel) {
    this.orderModel = orderModel
  }

  async load(id) {
    if (!id) {
      throw new MissingParamServerError('id')
    }
    try {
      const order = await this.orderModel.findOne({ _id: id })
      return order
    } catch (error) {
      if (error instanceof MongooseHelper.getTypeOfError()) {
        throw new InvalidParamError(error)
      }
      throw error
    }
  }
}
