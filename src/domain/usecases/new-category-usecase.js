const {
  MissingParamServerError,
  RepeatedNameError
} = require('../../utils/errors')

module.exports = class NewCategoryUseCase {
  constructor({ loadCategoryByNameRepository, createCategoryRepository } = {}) {
    this.loadCategoryByNameRepository = loadCategoryByNameRepository
    this.createCategoryRepository = createCategoryRepository
  }

  async record(httpRequest) {
    if (!httpRequest) {
      throw new MissingParamServerError('httpRequest')
    }

    const category = await this.loadCategoryByNameRepository.load(
      httpRequest.name
    )

    if (category) {
      throw new RepeatedNameError()
    }

    await this.createCategoryRepository.create({
      name: httpRequest.name
    })
  }
}
