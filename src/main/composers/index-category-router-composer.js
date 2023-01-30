const IndexCategoryRouter = require('../../presentation/routers/index-category-router')
const LoadAllCategoryRepository = require('../../infra/repositories/order/load-all-order-repository')
const categoryModel = require('../../infra/entities/CategoryModel')

module.exports = class IndexCategoryRouterComposer {
  static compose() {
    const loadAllCategoryRepository = new LoadAllCategoryRepository(
      categoryModel
    )
    return new IndexCategoryRouter({
      loadAllCategoryRepository
    })
  }
}
