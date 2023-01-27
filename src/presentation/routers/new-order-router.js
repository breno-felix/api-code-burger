const HttpResponse = require('../helpers/http-response')
const {
  MissingParamError,
  InvalidParamError,
  ProductNotCreatedError
} = require('../../utils/errors')

module.exports = class NewOrderRouter {
  constructor({ objectShapeValidator, newOrderUseCase } = {}) {
    this.objectShapeValidator = objectShapeValidator
    this.newOrderUseCase = newOrderUseCase
  }

  async route(httpRequest) {
    try {
      const requiredParams = ['products']
      requiredParams.forEach((param) => {
        if (!httpRequest.body[param]) {
          throw new MissingParamError(param)
        }
      })
      const requiredParamsRequest = ['userId']
      requiredParamsRequest.forEach((param) => {
        if (!httpRequest[param]) {
          throw new MissingParamError(param)
        }
      })
      await this.objectShapeValidator.isValid(httpRequest.body)
      const { products } = httpRequest.body
      const { userId: user_id } = httpRequest
      await this.newOrderUseCase.record({
        user_id,
        products
      })
      return HttpResponse.created()
    } catch (error) {
      if (error instanceof ProductNotCreatedError) {
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
