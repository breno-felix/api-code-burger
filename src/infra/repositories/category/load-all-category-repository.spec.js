const LoadAllCategoryRepository = require('./load-all-category-repository')
const MongooseHelper = require('../../helpers/mongoose-helper')
const env = require('../../../main/config/envfile')
const CategoryModel = require('../../entities/CategoryModel')

const makeSut = () => {
  return new LoadAllCategoryRepository(CategoryModel)
}

describe('Load All Category Repository', () => {
  beforeAll(async () => {
    await MongooseHelper.connect(env.urlMongooseTest)
  })

  afterEach(async () => {
    await CategoryModel.deleteMany()
  })

  afterAll(async () => {
    await MongooseHelper.disconnect()
  })

  test('Should return empty array if no categories is found', async () => {
    const sut = makeSut()
    const categories = await sut.load()
    expect(categories).toStrictEqual([])
  })

  test('Should return categories if categories is found', async () => {
    const sut = makeSut()
    const fakeCategory = new CategoryModel({
      name: 'any_name'
    })
    await fakeCategory.save()
    const fakeCategoryTwo = new CategoryModel({
      name: 'some_name'
    })
    await fakeCategoryTwo.save()
    const categories = await sut.load()
    expect(categories[0]._id).toEqual(fakeCategory._id)
    expect(categories[1]._id).toEqual(fakeCategoryTwo._id)
    expect(categories.length).toEqual(2)
  })

  test('Should throw if no CategoryModel is provided', async () => {
    const sut = new LoadAllCategoryRepository()
    const promise = sut.load()
    expect(promise).rejects.toThrow()
  })
})
