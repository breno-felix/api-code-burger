const HttpResponse = require('../../helpers/http-response')
const {
  MissingParamError,
  InvalidParamError,
  OrderNotCreatedError
} = require('../../../utils/errors')

module.exports = class UpdateOrderRouter {
  constructor({ objectShapeValidator, updateOrderUseCase } = {}) {
    this.objectShapeValidator = objectShapeValidator
    this.updateOrderUseCase = updateOrderUseCase
  }

  async route(httpRequest) {
    try {
      const requiredParams = ['status']
      requiredParams.forEach((param) => {
        if (!httpRequest.body[param]) {
          throw new MissingParamError(param)
        }
      })
      await this.objectShapeValidator.isValid(httpRequest.body)
      await this.updateOrderUseCase.update({
        status: httpRequest.body.status,
        order_id: httpRequest.params.order_id
      })
      return HttpResponse.noContent()
    } catch (error) {
      if (error instanceof OrderNotCreatedError) {
        return HttpResponse.badRequest(new OrderNotCreatedError())
      } else if (error instanceof InvalidParamError) {
        return HttpResponse.badRequest(error)
      } else if (error instanceof MissingParamError) {
        return HttpResponse.badRequest(error)
      }
      return HttpResponse.serverError()
    }
  }
}
