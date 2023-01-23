const { MissingParamServerError } = require('../../../utils/errors')

module.exports = class CreateUserRepository {
  constructor(userModel) {
    this.userModel = userModel
  }

  async create(userObject) {
    if (!userObject) {
      throw new MissingParamServerError('userObject')
    }
    await this.userModel.create(userObject)
  }
}
