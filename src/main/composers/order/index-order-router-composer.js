const IndexOrderRouter = require('../../../presentation/routers/order/index-order-router')
const LoadAllOrderRepository = require('../../../infra/repositories/order/load-all-order-repository')
const orderModel = require('../../../infra/entities/OrderModel')

module.exports = class IndexOrderRouterComposer {
  static compose() {
    const loadAllOrderRepository = new LoadAllOrderRepository(orderModel)
    return new IndexOrderRouter({
      loadAllOrderRepository
    })
  }
}
