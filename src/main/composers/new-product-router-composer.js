const NewProductRouter = require('../../presentation/routers/new-product-router')
const ObjectShapeValidator = require('../../utils/helpers/object-shape-validator')
const CreateProductRepository = require('../../infra/repositories/product/create-product-repository')
const productModel = require('../../infra/entities/ProductModel')
const yupProductSchema = require('../../utils/helpers/yup-productSchema')

module.exports = class NewProductRouterComposer {
  static compose() {
    const objectShapeValidator = new ObjectShapeValidator({
      yupSchema: yupProductSchema
    })
    const createProductRepository = new CreateProductRepository(productModel)
    return new NewProductRouter({
      objectShapeValidator,
      createProductRepository
    })
  }
}
