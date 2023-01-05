const HttpResponse = require('../helpers/http-response')
const { MissingParamError } = require('../../utils/errors')

module.exports = class SignUpRouter {
  constructor(signUpUseCase) {
    this.signUpUseCase = signUpUseCase
  }

  route(httpRequest) {
    if (!httpRequest || !httpRequest.body) {
      return {
        statusCode: 500
      }
    }
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
    this.signUpUseCase.signUp(name, email, password, repeatPassword, admin)
  }
}
