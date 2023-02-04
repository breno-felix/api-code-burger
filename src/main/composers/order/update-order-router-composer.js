const UpdateOrderRouter = require('../../../presentation/routers/order/update-order-router')
const ObjectShapeValidator = require('../../../utils/helpers/object-shape-validator')
const UpdateOrderRepository = require('../../../infra/repositories/order/update-order-repository')
const UpdateOrderUseCase = require('../../../domain/usecases/update-order-usecase')
const LoadOrderByIdRepository = require('../../../infra/repositories/order/load-order-by-id-repository')
const orderModel = require('../../../infra/entities/OrderModel')
const yupUpdateOrderSchema = require('../../../utils/helpers/yup-updateOrderSchema')

module.exports = class UpdateProductRouterComposer {
  static compose() {
    const updateOrderRepository = new UpdateOrderRepository(orderModel)
    const loadOrderByIdRepository = new LoadOrderByIdRepository(orderModel)
    const updateOrderUseCase = new UpdateOrderUseCase({
      loadOrderByIdRepository,
      updateOrderRepository
    })
    const objectShapeValidator = new ObjectShapeValidator({
      yupSchema: yupUpdateOrderSchema
    })
    return new UpdateOrderRouter({
      objectShapeValidator,
      updateOrderUseCase
    })
  }
}
