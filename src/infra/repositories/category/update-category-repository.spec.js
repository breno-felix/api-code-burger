const UpdateCategoryRepository = require('./update-category-repository')
const MongooseHelper = require('../../helpers/mongoose-helper')
const env = require('../../../main/config/envfile')
const CategoryModel = require('../../entities/CategoryModel')
const { MissingParamServerError } = require('../../../utils/errors')

const makeSut = () => {
  return new UpdateCategoryRepository(CategoryModel)
}

describe('Update Category Repository', () => {
  beforeAll(async () => {
    await MongooseHelper.connect(env.urlMongooseTest)
  })

  afterEach(async () => {
    await CategoryModel.deleteMany()
  })

  afterAll(async () => {
    await MongooseHelper.disconnect()
  })

  test('Should update category with the given object', async () => {
    const sut = makeSut()
    const fakeCategory = new CategoryModel({
      name: 'valid_name',
      imagePath: 'any_name'
    })
    await fakeCategory.save()

    const categoryObjectToUpdate = {
      name: 'other_name',
      imagePath: 'other_name',
      category_id: fakeCategory._id
    }
    await sut.update(categoryObjectToUpdate)
    const updatedCategory = await CategoryModel.find({})
    expect({
      name: updatedCategory[0].name,
      imagePath: updatedCategory[0].imagePath,
      category_id: fakeCategory._id
    }).toEqual(categoryObjectToUpdate)
  })

  test('Should throw if no categoryModel is provided', async () => {
    const sut = new UpdateCategoryRepository()
    const fakeCategory = new CategoryModel({
      name: 'valid_name',
      imagePath: 'any_name'
    })
    await fakeCategory.save()

    const categoryObjectToUpdate = {
      name: 'valid_name',
      imagePath: 'other_image_path',
      category_id: fakeCategory._id
    }
    const promise = sut.update(categoryObjectToUpdate)
    expect(promise).rejects.toThrow()
  })

  test('Should throw if no categoryObject is provided', async () => {
    const sut = makeSut()
    expect(sut.update()).rejects.toThrow(
      new MissingParamServerError('categoryObject')
    )
  })
})
