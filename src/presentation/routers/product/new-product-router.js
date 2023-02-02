const HttpResponse = require('../../helpers/http-response')
const RemoveUpload = require('../../helpers/remove-upload')
const {
  MissingParamError,
  InvalidParamError,
  CategoryNotCreatedError
} = require('../../../utils/errors')
module.exports = class NewProductRouter {
  constructor({ objectShapeValidator, newProductUseCase } = {}) {
    this.objectShapeValidator = objectShapeValidator
    this.newProductUseCase = newProductUseCase
  }

  async route(httpRequest) {
    try {
      const requiredParamsBody = ['name', 'price', 'category_id']
      requiredParamsBody.forEach((param) => {
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
      const { name, price, category_id, offer } = httpRequest.body
      const { key: imagePath } = httpRequest.file
      await this.newProductUseCase.record({
        name,
        price,
        category_id,
        offer,
        imagePath
      })
      return HttpResponse.created()
    } catch (error) {
      if (httpRequest && httpRequest.file && httpRequest.file.key) {
        await RemoveUpload.remove(httpRequest.file.key)
      }
      if (error instanceof CategoryNotCreatedError) {
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
