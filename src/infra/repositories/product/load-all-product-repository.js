module.exports = class LoadAllProductRepository {
  constructor(productModel) {
    this.productModel = productModel
  }

  async load() {
    const products = await this.productModel.find()
    return products
  }
}
