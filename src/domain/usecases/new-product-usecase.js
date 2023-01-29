const {
  MissingParamServerError,
  CategoryNotCreatedError,
  InvalidParamError
} = require('../../utils/errors')
const MongooseHelper = require('../../infra/helpers/mongoose-helper')

module.exports = class NewProductUseCase {
  constructor({ loadCategoryByIdRepository, createProductRepository } = {}) {
    this.loadCategoryByIdRepository = loadCategoryByIdRepository
    this.createProductRepository = createProductRepository
  }

  async record(httpRequest) {
    if (!httpRequest) {
      throw new MissingParamServerError('httpRequest')
    }
    try {
      const category = await this.loadCategoryByIdRepository.load(
        httpRequest.category_id
      )
      if (!category) {
        throw new CategoryNotCreatedError()
      }
      await this.createProductRepository.create(httpRequest)
    } catch (error) {
      if (error instanceof MongooseHelper.getTypeOfError()) {
        throw new InvalidParamError(error)
      }
      throw error
    }
  }
}
