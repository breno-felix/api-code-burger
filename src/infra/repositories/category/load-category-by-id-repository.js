const { MissingParamServerError } = require('../../../utils/errors')

module.exports = class LoadCategoryByIdRepository {
  constructor(categoryModel) {
    this.categoryModel = categoryModel
  }

  async load(id) {
    if (!id) {
      throw new MissingParamServerError('id')
    }

    const category = await this.categoryModel.findOne({ _id: id })
    return category
  }
}
