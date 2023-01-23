const { MissingParamServerError } = require('../../../utils/errors')

module.exports = class CreateCategoryRepository {
  constructor(categoryModel) {
    this.categoryModel = categoryModel
  }

  async create(categoryObject) {
    if (!categoryObject) {
      throw new MissingParamServerError('categoryObject')
    }
    await this.categoryModel.create(categoryObject)
  }
}
