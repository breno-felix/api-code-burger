const HttpResponse = require('../../helpers/http-response')

module.exports = class IndexCategoryRouter {
  constructor({ loadAllCategoryRepository } = {}) {
    this.loadAllCategoryRepository = loadAllCategoryRepository
  }

  async route() {
    try {
      const categories = await this.loadAllCategoryRepository.load()
      return HttpResponse.ok(categories)
    } catch (error) {
      return HttpResponse.serverError()
    }
  }
}
