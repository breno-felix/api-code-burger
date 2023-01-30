const IndexProductRouter = require('../../../presentation/routers/product/index-product-router')
const LoadAllProductRepository = require('../../../infra/repositories/product/load-all-product-repository')
const productModel = require('../../../infra/entities/ProductModel')

module.exports = class IndexProductRouterComposer {
  static compose() {
    const loadAllProductRepository = new LoadAllProductRepository(productModel)
    return new IndexProductRouter({
      loadAllProductRepository
    })
  }
}
