const {
  MissingParamServerError,
  InvalidParamError
} = require('../../../utils/errors')
const MongooseHelper = require('../../helpers/mongoose-helper')

module.exports = class LoadCategoryByIdRepository {
  constructor(categoryModel) {
    this.categoryModel = categoryModel
  }

  async load(id) {
    if (!id) {
      throw new MissingParamServerError('id')
    }
    try {
      const category = await this.categoryModel.findOne({ _id: id })
      return category
    } catch (error) {
      if (error instanceof MongooseHelper.getTypeOfError()) {
        throw new InvalidParamError(error)
      }
      throw error
    }
  }
}
