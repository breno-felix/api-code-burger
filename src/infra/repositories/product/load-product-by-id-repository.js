const {
  MissingParamServerError,
  InvalidParamError
} = require('../../../utils/errors')
const MongooseHelper = require('../../helpers/mongoose-helper')

module.exports = class LoadProductByIdRepository {
  constructor(productModel) {
    this.productModel = productModel
  }

  async load(id) {
    if (!id) {
      throw new MissingParamServerError('id')
    }
    try {
      const product = await this.productModel.findOne({ _id: id })
      return product
    } catch (error) {
      if (error instanceof MongooseHelper.getTypeOfError()) {
        throw new InvalidParamError(error)
      }
      throw error
    }
  }
}
