const {
  MissingParamServerError,
  RepeatedNameError,
  CategoryNotCreatedError,
  MissingParamError
} = require('../../utils/errors')
const RemoveUpload = require('../../presentation/helpers/remove-upload')
module.exports = class UpdateCategoryUseCase {
  constructor({
    loadCategoryByNameRepository,
    loadCategoryByIdRepository,
    updateCategoryRepository
  } = {}) {
    this.loadCategoryByNameRepository = loadCategoryByNameRepository
    this.loadCategoryByIdRepository = loadCategoryByIdRepository
    this.updateCategoryRepository = updateCategoryRepository
  }

  async update(httpRequest) {
    if (!httpRequest) {
      throw new MissingParamServerError('httpRequest')
    }
    const { name, imagePath, category_id } = httpRequest

    if (!name && !imagePath) {
      throw new MissingParamError('all params')
    }

    const category = await this.loadCategoryByIdRepository.load(category_id)
    if (!category) {
      throw new CategoryNotCreatedError()
    }

    if (name) {
      const categoryByName = await this.loadCategoryByNameRepository.load(name)
      if (categoryByName) {
        throw new RepeatedNameError()
      }
    }
    await this.updateCategoryRepository.update(httpRequest)
    if (category.imagePath) {
      await RemoveUpload.remove(category.imagePath)
    }
  }
}
