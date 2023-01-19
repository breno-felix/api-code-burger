class CreateCategoryRepository {
  constructor(categoryModel) {
    this.categoryModel = categoryModel
  }

  async create(categoryObject) {
    await this.categoryModel.create(categoryObject)
  }
}

const MongooseHelper = require('../helpers/mongoose-helper')
const env = require('../../main/config/envfile')
const CategoryModel = require('../entities/CategoryModel')

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
})
