const HttpResponse = require('../helpers/http-response')
const { MissingParamError, InvalidParamError } = require('../../utils/errors')

module.exports = class NewProductRouter {
  constructor({ objectShapeValidator, createProductRepository } = {}) {
    this.objectShapeValidator = objectShapeValidator
    this.createProductRepository = createProductRepository
  }

  async route(httpRequest) {
    try {
      const requiredParamsBody = ['name', 'price', 'category_id']
      requiredParamsBody.forEach((param) => {
        if (!httpRequest.body[param]) {
          throw new MissingParamError(param)
        }
      })
      const requiredParamsFile = ['filename']
      requiredParamsFile.forEach((param) => {
        if (!httpRequest.file || !httpRequest.file[param]) {
          throw new MissingParamError(param)
        }
      })
      const { name, price, category_id } = httpRequest.body
      const { filename: imagePath } = httpRequest.file
      await this.objectShapeValidator.isValid(httpRequest.body)
      await this.createProductRepository.create({
        name,
        price,
        category_id,
        imagePath
      })
      return HttpResponse.created()
    } catch (error) {
      if (error instanceof InvalidParamError) {
        return HttpResponse.badRequest(error)
      } else if (error instanceof MissingParamError) {
        return HttpResponse.badRequest(error)
      }
      return HttpResponse.serverError()
    }
  }
}
