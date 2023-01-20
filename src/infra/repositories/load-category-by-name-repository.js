const { MissingParamServerError } = require('../../utils/errors')

module.exports = class LoadCategoryByNameRepository {
  constructor(categoryModel) {
    this.categoryModel = categoryModel
  }

  async load(name) {
    if (!name) {
      throw new MissingParamServerError('name')
    }
    const category = await this.categoryModel.findOne({ name })
    return category
  }
}
