const IndexCategoryRouter = require('../../../presentation/routers/category/index-category-router')
const LoadAllCategoryRepository = require('../../../infra/repositories/category/load-all-category-repository')
const categoryModel = require('../../../infra/entities/CategoryModel')

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
