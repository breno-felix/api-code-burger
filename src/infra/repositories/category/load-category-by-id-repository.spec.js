const LoadCategoryByIdRepository = require('./load-category-by-id-repository')
const MongooseHelper = require('../../helpers/mongoose-helper')
const env = require('../../../main/config/envfile')
const CategoryModel = require('../../entities/CategoryModel')
const { MissingParamServerError } = require('../../../utils/errors')

const makeSut = () => {
  return new LoadCategoryByIdRepository(CategoryModel)
}

describe('LoadCategoryById Repository', () => {
  beforeAll(async () => {
    await MongooseHelper.connect(env.urlMongooseTest)
  })

  afterEach(async () => {
    await CategoryModel.deleteMany()
  })

  afterAll(async () => {
    await MongooseHelper.disconnect()
  })

  test('Should return null if no category is found', async () => {
    const sut = makeSut()
    const category = await sut.load('63d26841431c2ca8e12c2832')
    expect(category).toBeNull()
  })

  test('Should return an category if category is found', async () => {
    const sut = makeSut()
    const fakeCategory = new CategoryModel({
      name: 'valid_name'
    })
    await fakeCategory.save()
    const category = await sut.load(fakeCategory._id)
    expect(category._id).toEqual(fakeCategory._id)
  })

  test('Should throw if no CategoryModel is provided', async () => {
    const sut = new LoadCategoryByIdRepository()
    const promise = sut.load('63d26841431c2ca8e12c2832')
    expect(promise).rejects.toThrow()
  })

  test('Should throw if no id is provided', async () => {
    const sut = makeSut()
    const promise = sut.load()
    expect(promise).rejects.toThrow(new MissingParamServerError('id'))
  })
})
