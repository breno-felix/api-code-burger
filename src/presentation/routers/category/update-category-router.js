const HttpResponse = require('../../helpers/http-response')
const RemoveUpload = require('../../helpers/remove-upload')
const {
  MissingParamError,
  InvalidParamError,
  RepeatedNameError,
  CategoryNotCreatedError
} = require('../../../utils/errors')
module.exports = class UpdateCategoryRouter {
  constructor({ updateCategoryUseCase, objectShapeValidator } = {}) {
    this.updateCategoryUseCase = updateCategoryUseCase
    this.objectShapeValidator = objectShapeValidator
  }

  async route(httpRequest) {
    try {
      await this.objectShapeValidator.isValid(httpRequest.body)
      let imagePath
      if (httpRequest.file) {
        imagePath = httpRequest.file.key
      }
      await this.updateCategoryUseCase.update({
        name: httpRequest.body.name,
        imagePath,
        category_id: httpRequest.params.category_id
      })
      return HttpResponse.noContent()
    } catch (error) {
      if (httpRequest && httpRequest.file && httpRequest.file.key) {
        await RemoveUpload.remove(httpRequest.file.key)
      }
      if (error instanceof RepeatedNameError) {
        return HttpResponse.badRequest(new RepeatedNameError())
      } else if (error instanceof CategoryNotCreatedError) {
        return HttpResponse.badRequest(new CategoryNotCreatedError())
      } else if (error instanceof InvalidParamError) {
        return HttpResponse.badRequest(error)
      } else if (error instanceof MissingParamError) {
        return HttpResponse.badRequest(error)
      }
      return HttpResponse.serverError()
    }
  }
}
