const jwt = require('jsonwebtoken')
const { MissingParamServerError } = require('../errors')

module.exports = class TokenGenerator {
  constructor({ secret, expiresIn } = {}) {
    this.secret = secret
    this.expiresIn = expiresIn
  }

  async generate(id, name) {
    if (!this.secret) {
      throw new MissingParamServerError('secret')
    }
    if (!id) {
      throw new MissingParamServerError('id')
    }
    if (!name) {
      throw new MissingParamServerError('name')
    }
    return jwt.sign({ id, name }, this.secret, { expiresIn: this.expiresIn })
  }
}
