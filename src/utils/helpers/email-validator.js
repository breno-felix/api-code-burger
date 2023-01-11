const validator = require('validator')
const { MissingParamServerError } = require('../errors')

module.exports = class EmailValidator {
  isValid(email) {
    if (!email) {
      throw new MissingParamServerError('email')
    }
    return validator.isEmail(email)
  }
}
