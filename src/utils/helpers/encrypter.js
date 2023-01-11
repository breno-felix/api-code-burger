const bcrypt = require('bcrypt')
const { MissingParamServerError } = require('../errors')

module.exports = class Encrypter {
  async compare(value, hash) {
    if (!value) {
      throw new MissingParamServerError('value')
    }
    if (!hash) {
      throw new MissingParamServerError('hash')
    }
    const isValid = await bcrypt.compare(value, hash)
    return isValid
  }
}
