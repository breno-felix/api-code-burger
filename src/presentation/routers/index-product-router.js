const HttpResponse = require('../helpers/http-response')

module.exports = class IndexProductRouter {
  constructor({ loadAllProductRepository } = {}) {
    this.loadAllProductRepository = loadAllProductRepository
  }

  async route() {
    try {
      const products = await this.loadAllProductRepository.load()
      return HttpResponse.ok(products)
    } catch (error) {
      return HttpResponse.serverError()
    }
  }
}
