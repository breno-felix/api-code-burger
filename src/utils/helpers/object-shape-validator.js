const { ValidationError } = require('yup')
const { InvalidParamError, MissingParamError } = require('../errors')

module.exports = class ObjectShapeValidator {
  constructor({ yupSchema } = {}) {
    this.yupSchema = yupSchema
  }

  async isValid(httpRequest) {
    try {
      if (!httpRequest) {
        throw new MissingParamError('httpRequest')
      }
      await this.yupSchema.validateSync(httpRequest.body)
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new InvalidParamError(error.errors)
      }
      throw error
    }
  }
}
