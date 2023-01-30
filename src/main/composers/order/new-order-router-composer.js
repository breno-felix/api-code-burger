const NewOrderRouter = require('../../../presentation/routers/order/new-order-router')
const ObjectShapeValidator = require('../../../utils/helpers/object-shape-validator')
const NewOrderUseCase = require('../../../domain/usecases/new-order-usecase')
const LoadProductByIdRepository = require('../../../infra/repositories/product/load-product-by-id-repository')
const CreateOrderRepository = require('../../../infra/repositories/order/create-order-repository')
const productModel = require('../../../infra/entities/ProductModel')
const orderModel = require('../../../infra/entities/OrderModel')
const yupOrderSchema = require('../../../utils/helpers/yup-orderSchema')

module.exports = class NewOrderRouterComposer {
  static compose() {
    const createOrderRepository = new CreateOrderRepository(orderModel)
    const loadProductByIdRepository = new LoadProductByIdRepository(
      productModel
    )
    const newOrderUseCase = new NewOrderUseCase({
      loadProductByIdRepository,
      createOrderRepository
    })
    const objectShapeValidator = new ObjectShapeValidator({
      yupSchema: yupOrderSchema
    })
    return new NewOrderRouter({
      objectShapeValidator,
      newOrderUseCase
    })
  }
}
