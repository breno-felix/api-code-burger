const { MissingParamServerError } = require('../../utils/errors')

module.exports = class LoadUserByEmailRepository {
  constructor(userModel) {
    this.userModel = userModel
  }

  async load(email) {
    if (!email) {
      throw new MissingParamServerError('email')
    }
    const user = await this.userModel.findOne({ email })
    return user
  }
}
