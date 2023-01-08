const HttpResponse = require('../helpers/http-response')
const {
  MissingParamError,
  RepeatPasswordError,
  RepeatedEmailError,
  InvalidParamError
} = require('../../utils/errors')

module.exports = class SignUpRouter {
  constructor({ signUpUseCase, userObjectShapeValidator } = {}) {
    this.signUpUseCase = signUpUseCase
    this.userObjectShapeValidator = userObjectShapeValidator
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

      await this.userObjectShapeValidator.isValid(httpRequest)

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
      } else if (error instanceof RepeatedEmailError) {
        return HttpResponse.badRequest(new RepeatedEmailError())
      } else if (error instanceof InvalidParamError) {
        return HttpResponse.badRequest(error)
      }
      return HttpResponse.serverError()
    }
  }
}
