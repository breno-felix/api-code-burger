const { MissingParamServerError } = require('../../../utils/errors')

module.exports = class UpdateCategoryRepository {
  constructor(categoryModel) {
    this.categoryModel = categoryModel
  }

  async update(categoryObject) {
    if (!categoryObject) {
      throw new MissingParamServerError('categoryObject')
    }
    const { name, imagePath, category_id } = categoryObject
    await this.categoryModel.updateOne(
      { _id: category_id },
      {
        name,
        imagePath
      }
    )
  }
}
