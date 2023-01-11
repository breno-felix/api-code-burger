const HttpResponse = require('../helpers/http-response')
const { InvalidParamError, MissingParamError } = require('../../utils/errors')
module.exports = class LoginRouter {
  constructor({ authUseCase, emailValidator } = {}) {
    this.authUseCase = authUseCase
    this.emailValidator = emailValidator
  }

  async route(httpRequest) {
    try {
      const { email, password } = httpRequest.body

      if (!email) {
        throw new MissingParamError('email')
      }
      if (!this.emailValidator.isValid(email)) {
        throw new InvalidParamError('email')
      }
      if (!password) {
        throw new MissingParamError('password')
      }
      const accessToken = await this.authUseCase.auth({ email, password })
      if (!accessToken) {
        return HttpResponse.unauthorizedError()
      }
      return HttpResponse.ok({ accessToken })
    } catch (error) {
      if (
        error instanceof MissingParamError ||
        error instanceof InvalidParamError
      ) {
        return HttpResponse.badRequest(error)
      }
      return HttpResponse.serverError()
    }
  }
}
