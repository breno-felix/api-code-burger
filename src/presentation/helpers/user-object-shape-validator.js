const userSchema = require('./userSchema')
const { ValidationError } = require('yup')
const { InvalidParamError, MissingParamError } = require('../../utils/errors')

module.exports = class UserObjectShapeValidator {
  async isValid(httpRequest) {
    try {
      if (!httpRequest) {
        throw new MissingParamError('httpRequest')
      }
      await userSchema.validateSync(httpRequest.body)
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new InvalidParamError(error.errors)
      }
      throw error
    }
  }
}
