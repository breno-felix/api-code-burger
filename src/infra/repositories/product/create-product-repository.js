const { MissingParamServerError } = require('../../../utils/errors')

module.exports = class CreateProductRepository {
  constructor(productModel) {
    this.productModel = productModel
  }

  async create(productObject) {
    if (!productObject) {
      throw new MissingParamServerError('productObject')
    }
    return await this.productModel.create(productObject)
  }
}
