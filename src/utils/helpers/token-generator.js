const jwt = require('jsonwebtoken')
const { MissingParamServerError } = require('../errors')

module.exports = class TokenGenerator {
  constructor({ secret, expiresIn } = {}) {
    this.secret = secret
    this.expiresIn = expiresIn
  }

  async generate(id) {
    if (!this.secret) {
      throw new MissingParamServerError('secret')
    }
    if (!id) {
      throw new MissingParamServerError('id')
    }
    return jwt.sign({ id }, this.secret, { expiresIn: this.expiresIn })
  }
}
