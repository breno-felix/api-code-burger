const UpdateProductRouter = require('../../../presentation/routers/product/update-product-router')
const ObjectShapeValidator = require('../../../utils/helpers/object-shape-validator')
const UpdateProductRepository = require('../../../infra/repositories/product/update-product-repository')
const UpdateProductUseCase = require('../../../domain/usecases/update-product-usecase')
const LoadCategoryByIdRepository = require('../../../infra/repositories/category/load-category-by-id-repository')
const LoadProductByIdRepository = require('../../../infra/repositories/product/load-product-by-id-repository')
const productModel = require('../../../infra/entities/ProductModel')
const categoryModel = require('../../../infra/entities/CategoryModel')
const yupProductSchema = require('../../../utils/helpers/yup-productSchema')

module.exports = class UpdateProductRouterComposer {
  static compose() {
    const updateProductRepository = new UpdateProductRepository(productModel)
    const loadProductByIdRepository = new LoadProductByIdRepository(
      productModel
    )
    const loadCategoryByIdRepository = new LoadCategoryByIdRepository(
      categoryModel
    )
    const updateProductUseCase = new UpdateProductUseCase({
      loadCategoryByIdRepository,
      loadProductByIdRepository,
      updateProductRepository
    })
    const objectShapeValidator = new ObjectShapeValidator({
      yupSchema: yupProductSchema
    })
    return new UpdateProductRouter({
      objectShapeValidator,
      updateProductUseCase
    })
  }
}
