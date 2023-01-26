const {
  MissingParamServerError,
  CategoryNotCreatedError
} = require('../../utils/errors')

module.exports = class NewProductUseCase {
  constructor({ loadCategoryByIdRepository, createProductRepository } = {}) {
    this.loadCategoryByIdRepository = loadCategoryByIdRepository
    this.createProductRepository = createProductRepository
  }

  async record(httpRequest) {
    if (!httpRequest) {
      throw new MissingParamServerError('httpRequest')
    }

    const category = await this.loadCategoryByIdRepository.load(
      httpRequest.category_id
    )

    if (!category) {
      throw new CategoryNotCreatedError()
    }

    await this.createProductRepository.create(httpRequest)
  }
}
