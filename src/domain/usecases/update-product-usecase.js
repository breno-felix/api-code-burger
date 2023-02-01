const {
  MissingParamServerError,
  CategoryNotCreatedError,
  ProductNotCreatedError
} = require('../../utils/errors')

module.exports = class UpdateProductUseCase {
  constructor({
    loadCategoryByIdRepository,
    loadProductByIdRepository,
    updateProductRepository
  } = {}) {
    this.loadCategoryByIdRepository = loadCategoryByIdRepository
    this.loadProductByIdRepository = loadProductByIdRepository
    this.updateProductRepository = updateProductRepository
  }

  async update(httpRequest) {
    if (!httpRequest) {
      throw new MissingParamServerError('httpRequest')
    }

    const product = await this.loadProductByIdRepository.load(
      httpRequest.product_id
    )
    if (!product) {
      throw new ProductNotCreatedError()
    }

    if (httpRequest.category_id) {
      const category = await this.loadCategoryByIdRepository.load(
        httpRequest.category_id
      )
      if (!category) {
        throw new CategoryNotCreatedError()
      }
    }

    await this.updateProductRepository.update(httpRequest)
  }
}
