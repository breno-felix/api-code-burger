const { MissingParamServerError } = require('../../../utils/errors')

module.exports = class UpdateAccessTokenRepository {
  constructor(userModel) {
    this.userModel = userModel
  }

  async update(userId, accessToken) {
    if (!userId) {
      throw new MissingParamServerError('userId')
    }
    if (!accessToken) {
      throw new MissingParamServerError('accessToken')
    }
    await this.userModel.updateOne(
      {
        _id: userId
      },
      {
        $set: {
          accessToken
        }
      }
    )
  }
}
