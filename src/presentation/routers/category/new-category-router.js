const HttpResponse = require('../../helpers/http-response')
const RemoveUpload = require('../../helpers/remove-upload')
const {
  MissingParamError,
  InvalidParamError,
  RepeatedNameError
} = require('../../../utils/errors')
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
      const requiredParamsFile = ['key']
      requiredParamsFile.forEach((param) => {
        if (!httpRequest.file || !httpRequest.file[param]) {
          throw new MissingParamError(param)
        }
      })
      await this.objectShapeValidator.isValid(httpRequest.body)
      await this.newCategoryUseCase.record({
        name: httpRequest.body.name,
        imagePath: httpRequest.file.key
      })
      return HttpResponse.created()
    } catch (error) {
      if (httpRequest && httpRequest.file && httpRequest.file.key) {
        RemoveUpload.remove(httpRequest.file.key)
      }
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
