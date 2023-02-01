const { MissingParamServerError } = require('../../../utils/errors')

module.exports = class UpdateProductRepository {
  constructor(productModel) {
    this.productModel = productModel
  }

  async update(productObject) {
    if (!productObject) {
      throw new MissingParamServerError('productObject')
    }
    const { name, price, offer, category_id, imagePath, product_id } =
      productObject
    await this.productModel.update(
      { _id: product_id },
      {
        name,
        price,
        offer,
        category_id,
        imagePath
      }
    )
  }
}
