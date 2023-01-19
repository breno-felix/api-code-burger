const CreateCategoryRepository = require('./create-category-repository')
const MongooseHelper = require('../helpers/mongoose-helper')
const env = require('../../main/config/envfile')
const CategoryModel = require('../entities/CategoryModel')
const { MissingParamServerError } = require('../../utils/errors')

const makeSut = () => {
  return new CreateCategoryRepository(CategoryModel)
}

describe('CreateCategory Repository', () => {
  beforeAll(async () => {
    await MongooseHelper.connect(env.urlMongooseTest)
  })

  beforeEach(async () => {
    await CategoryModel.deleteMany()
  })

  afterAll(async () => {
    await MongooseHelper.disconnect()
  })

  test('Should create category with the given object', async () => {
    const sut = makeSut()

    const validCategory = {
      name: 'valid_name'
    }
    await sut.create(validCategory)
    const category = await CategoryModel.findOne({
      name: validCategory.name
    })
    expect({
      name: category.name
    }).toEqual(validCategory)
    expect(category._id).toEqual(expect.anything())
  })

  test('Should throw if no categoryModel if provided', async () => {
    const sut = new CreateCategoryRepository()
    const validCategory = {
      name: 'valid_name'
    }
    const promise = sut.create(validCategory)
    expect(promise).rejects.toThrow()
  })

  test('Should throw if no categoryObject is provided', async () => {
    const sut = makeSut()
    expect(sut.create()).rejects.toThrow(
      new MissingParamServerError('categoryObject')
    )
  })
})
