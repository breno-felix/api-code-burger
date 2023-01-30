const HttpResponse = require('../../helpers/http-response')
const {
  MissingParamError,
  RepeatPasswordError,
  RepeatedEmailError,
  InvalidParamError
} = require('../../../utils/errors')

module.exports = class SignUpRouter {
  constructor({ signUpUseCase, objectShapeValidator } = {}) {
    this.signUpUseCase = signUpUseCase
    this.objectShapeValidator = objectShapeValidator
  }

  async route(httpRequest) {
    try {
      const requiredParams = ['name', 'email', 'password', 'repeatPassword']
      requiredParams.forEach((param) => {
        if (!httpRequest.body[param]) {
          throw new MissingParamError(param)
        }
      })
      await this.objectShapeValidator.isValid(httpRequest.body)
      await this.signUpUseCase.signUp(httpRequest.body)
      return HttpResponse.created()
    } catch (error) {
      if (error instanceof RepeatPasswordError) {
        return HttpResponse.badRequest(new RepeatPasswordError())
      } else if (error instanceof RepeatedEmailError) {
        return HttpResponse.badRequest(new RepeatedEmailError())
      } else if (error instanceof InvalidParamError) {
        return HttpResponse.badRequest(error)
      } else if (error instanceof MissingParamError) {
        return HttpResponse.badRequest(error)
      }
      return HttpResponse.serverError()
    }
  }
}
