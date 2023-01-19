const NewCategoryRouter = require('../../presentation/routers/new-category-router')
const NewCategoryUseCase = require('../../domain/usecases/new-category-usecase')
const LoadCategoryByNameRepository = require('../../infra/repositories/load-category-by-name-repository')
const CreateCategoryRepository = require('../../infra/repositories/create-category-repository')
const ObjectShapeValidator = require('../../utils/helpers/object-shape-validator')
const categoryModel = require('../../infra/entities/CategoryModel')
const yupCategorySchema = require('../../utils/helpers/yup-categorySchema')

module.exports = class NewCategoryRouterComposer {
  static compose() {
    const createCategoryRepository = new CreateCategoryRepository(categoryModel)
    const loadCategoryByNameRepository = new LoadCategoryByNameRepository(
      categoryModel
    )
    const newCategoryUseCase = new NewCategoryUseCase({
      loadCategoryByNameRepository,
      createCategoryRepository
    })
    const objectShapeValidator = new ObjectShapeValidator({
      yupSchema: yupCategorySchema
    })
    return new NewCategoryRouter({
      newCategoryUseCase,
      objectShapeValidator
    })
  }
}
