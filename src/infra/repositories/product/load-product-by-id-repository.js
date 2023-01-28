const { MissingParamServerError } = require('../../../utils/errors')

module.exports = class LoadProductByIdRepository {
  constructor(productModel) {
    this.productModel = productModel
  }

  async load(id) {
    if (!id) {
      throw new MissingParamServerError('id')
    }
    const product = await this.productModel.findOne({ _id: id })
    return product
  }
}
