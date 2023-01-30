const NewProductRouter = require('../../../presentation/routers/new-product-router')
const ObjectShapeValidator = require('../../../utils/helpers/object-shape-validator')
const CreateProductRepository = require('../../../infra/repositories/product/create-product-repository')
const NewProductUseCase = require('../../../domain/usecases/new-product-usecase')
const LoadCategoryByIdRepository = require('../../../infra/repositories/category/load-category-by-id-repository')
const productModel = require('../../../infra/entities/ProductModel')
const categoryModel = require('../../../infra/entities/CategoryModel')
const yupProductSchema = require('../../../utils/helpers/yup-productSchema')

module.exports = class NewProductRouterComposer {
  static compose() {
    const createProductRepository = new CreateProductRepository(productModel)
    const loadCategoryByIdRepository = new LoadCategoryByIdRepository(
      categoryModel
    )
    const newProductUseCase = new NewProductUseCase({
      loadCategoryByIdRepository,
      createProductRepository
    })
    const objectShapeValidator = new ObjectShapeValidator({
      yupSchema: yupProductSchema
    })
    return new NewProductRouter({
      objectShapeValidator,
      newProductUseCase
    })
  }
}
