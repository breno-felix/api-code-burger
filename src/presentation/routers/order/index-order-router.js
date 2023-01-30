const HttpResponse = require('../../helpers/http-response')

module.exports = class IndexOrderRouter {
  constructor({ loadAllOrderRepository } = {}) {
    this.loadAllOrderRepository = loadAllOrderRepository
  }

  async route() {
    try {
      const orders = await this.loadAllOrderRepository.load()
      return HttpResponse.ok(orders)
    } catch (error) {
      return HttpResponse.serverError()
    }
  }
}
