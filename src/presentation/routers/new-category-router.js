const HttpResponse = require('../helpers/http-response')
const {
  MissingParamError,
  InvalidParamError,
  RepeatedNameError
} = require('../../utils/errors')

module.exports = class NewCategoryRouter {
  constructor({ newCategoryUseCase, objectShapeValidator } = {}) {
    this.newCategoryUseCase = newCategoryUseCase
    this.objectShapeValidator = objectShapeValidator
  }

  async route(httpRequest) {
    try {
      const requiredParams = ['name']
      requiredParams.forEach((param) => {
        if (!httpRequest.body[param]) {
          throw new MissingParamError(param)
        }
      })
      await this.objectShapeValidator.isValid(httpRequest.body)
      await this.newCategoryUseCase.record(httpRequest.body)
      return HttpResponse.created()
    } catch (error) {
      if (error instanceof RepeatedNameError) {
        return HttpResponse.badRequest(new RepeatedNameError())
      } else if (error instanceof InvalidParamError) {
        return HttpResponse.badRequest(error)
      } else if (error instanceof MissingParamError) {
        return HttpResponse.badRequest(error)
      }
      return HttpResponse.serverError()
    }
  }
}
