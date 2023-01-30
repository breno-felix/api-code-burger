module.exports = class LoadAllOrderRepository {
  constructor(orderModel) {
    this.orderModel = orderModel
  }

  async load() {
    const orders = await this.orderModel.find()
    return orders
  }
}
