const HttpResponse = require('../helpers/http-response')
const { MissingParamError, RepeatPasswordError } = require('../../utils/errors')

module.exports = class SignUpRouter {
  constructor({ signUpUseCase } = {}) {
    this.signUpUseCase = signUpUseCase
  }

  async route(httpRequest) {
    try {
      const { name, email, password, repeatPassword, admin } = httpRequest.body
      if (!name) {
        return HttpResponse.badRequest(new MissingParamError('name'))
      }
      if (!email) {
        return HttpResponse.badRequest(new MissingParamError('email'))
      }
      if (!password) {
        return HttpResponse.badRequest(new MissingParamError('password'))
      }
      if (!repeatPassword) {
        return HttpResponse.badRequest(new MissingParamError('repeatPassword'))
      }

      await this.signUpUseCase.signUp(
        name,
        email,
        password,
        repeatPassword,
        admin
      )

      return HttpResponse.Created()
    } catch (error) {
      if (error instanceof RepeatPasswordError) {
        return HttpResponse.badRequest(new RepeatPasswordError())
      }
      return HttpResponse.serverError()
    }
  }
}
