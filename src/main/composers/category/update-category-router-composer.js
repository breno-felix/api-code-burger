const UpdateCategoryRouter = require('../../../presentation/routers/category/update-category-router')
const UpdateCategoryUseCase = require('../../../domain/usecases/update-category-usecase')
const LoadCategoryByNameRepository = require('../../../infra/repositories/category/load-category-by-name-repository')
const LoadCategoryByIdRepository = require('../../../infra/repositories/category/load-category-by-id-repository')
const UpdateCategoryRepository = require('../../../infra/repositories/category/update-category-repository')
const ObjectShapeValidator = require('../../../utils/helpers/object-shape-validator')
const categoryModel = require('../../../infra/entities/CategoryModel')
const yupCategorySchema = require('../../../utils/helpers/yup-categorySchema')

module.exports = class UpdateCategoryRouterComposer {
  static compose() {
    const updateCategoryRepository = new UpdateCategoryRepository(categoryModel)
    const loadCategoryByNameRepository = new LoadCategoryByNameRepository(
      categoryModel
    )
    const loadCategoryByIdRepository = new LoadCategoryByIdRepository(
      categoryModel
    )
    const updateCategoryUseCase = new UpdateCategoryUseCase({
      loadCategoryByIdRepository,
      loadCategoryByNameRepository,
      updateCategoryRepository
    })
    const objectShapeValidator = new ObjectShapeValidator({
      yupSchema: yupCategorySchema
    })
    return new UpdateCategoryRouter({
      objectShapeValidator,
      updateCategoryUseCase
    })
  }
}
