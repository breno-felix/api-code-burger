const bcrypt = require('bcrypt')
const { MissingParamServerError } = require('../errors')

module.exports = class Encrypter {
  constructor(saltRounds) {
    this.saltRounds = saltRounds
  }

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

  async hash(value) {
    if (!value) {
      throw new MissingParamServerError('value')
    }
    if (!this.saltRounds) {
      throw new MissingParamServerError('saltRounds')
    }
    if (typeof this.saltRounds === 'string') {
      this.saltRounds = parseInt(this.saltRounds)
    }

    const hash = await bcrypt.hash(value, this.saltRounds)
    return hash
  }
}
