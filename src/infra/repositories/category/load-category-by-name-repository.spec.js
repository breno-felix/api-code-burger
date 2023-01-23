const LoadCategoryByNameRepository = require('./load-category-by-name-repository')
const MongooseHelper = require('../../helpers/mongoose-helper')
const env = require('../../../main/config/envfile')
const CategoryModel = require('../../entities/CategoryModel')
const { MissingParamServerError } = require('../../../utils/errors')

const makeSut = () => {
  return new LoadCategoryByNameRepository(CategoryModel)
}

describe('LoadCategoryByName Repository', () => {
  beforeAll(async () => {
    await MongooseHelper.connect(env.urlMongooseTest)
  })

  beforeEach(async () => {
    await CategoryModel.deleteMany()
  })

  afterAll(async () => {
    await MongooseHelper.disconnect()
  })

  test('Should return null if no category is found', async () => {
    const sut = makeSut()
    const category = await sut.load('invalid_name')
    expect(category).toBeNull()
  })

  test('Should return an category if category is found', async () => {
    const sut = makeSut()
    const fakeCategory = new CategoryModel({
      name: 'valid_name'
    })
    await fakeCategory.save()
    const category = await sut.load('valid_name')
    expect(category._id).toEqual(fakeCategory._id)
  })

  test('Should throw if no CategoryModel is provided', async () => {
    const sut = new LoadCategoryByNameRepository()
    const promise = sut.load('any_name')
    expect(promise).rejects.toThrow()
  })

  test('Should throw if no name is provided', async () => {
    const sut = makeSut()
    const promise = sut.load()
    expect(promise).rejects.toThrow(new MissingParamServerError('name'))
  })
})
