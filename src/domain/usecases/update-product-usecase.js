const {
  MissingParamServerError,
  CategoryNotCreatedError,
  ProductNotCreatedError,
  MissingParamError
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

    const { name, price, offer, category_id, imagePath, product_id } =
      httpRequest

    if (!name && !price && !offer && !category_id && !imagePath) {
      throw new MissingParamError('all params')
    }

    const product = await this.loadProductByIdRepository.load(product_id)
    if (!product) {
      throw new ProductNotCreatedError()
    }

    if (httpRequest.category_id) {
      const category = await this.loadCategoryByIdRepository.load(category_id)
      if (!category) {
        throw new CategoryNotCreatedError()
      }
    }

    await this.updateProductRepository.update(httpRequest)
  }
}
