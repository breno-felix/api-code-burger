const HttpResponse = require('../../helpers/http-response')
const RemoveUpload = require('../../helpers/remove-upload')
const {
  InvalidParamError,
  CategoryNotCreatedError,
  ProductNotCreatedError,
  MissingParamError
} = require('../../../utils/errors')
module.exports = class UpdateProductRouter {
  constructor({ objectShapeValidator, updateProductUseCase } = {}) {
    this.objectShapeValidator = objectShapeValidator
    this.updateProductUseCase = updateProductUseCase
  }

  async route(httpRequest) {
    try {
      await this.objectShapeValidator.isValid(httpRequest.body)
      const { name, price, category_id, offer } = httpRequest.body
      let imagePath
      if (httpRequest.file) {
        imagePath = httpRequest.file.key
      }
      const { product_id } = httpRequest.params
      await this.updateProductUseCase.update({
        name,
        price,
        category_id,
        offer,
        imagePath,
        product_id
      })
      return HttpResponse.noContent()
    } catch (error) {
      if (httpRequest && httpRequest.file && httpRequest.file.key) {
        await RemoveUpload.remove(httpRequest.file.key)
      }
      if (error instanceof CategoryNotCreatedError) {
        return HttpResponse.badRequest(new CategoryNotCreatedError())
      } else if (error instanceof ProductNotCreatedError) {
        return HttpResponse.badRequest(new ProductNotCreatedError())
      } else if (error instanceof InvalidParamError) {
        return HttpResponse.badRequest(error)
      } else if (error instanceof MissingParamError) {
        return HttpResponse.badRequest(error)
      }
      return HttpResponse.serverError()
    }
  }
}
