class CreateProductRepository {
  constructor(productModel) {
    this.productModel = productModel
  }

  async create(productObject) {
    return await this.productModel.create(productObject)
  }
}

const MongooseHelper = require('../helpers/mongoose-helper')
const env = require('../../main/config/envfile')
const ProductModel = require('../entities/ProductModel')
const CategoryModel = require('../entities/CategoryModel')

const makeSut = () => {
  return new CreateProductRepository(ProductModel)
}

describe('Create Product Repository', () => {
  beforeAll(async () => {
    await MongooseHelper.connect(env.urlMongooseTest)
  })

  beforeEach(async () => {
    await ProductModel.deleteMany()
    await CategoryModel.deleteMany()
  })

  afterAll(async () => {
    await MongooseHelper.disconnect()
  })

  test('Should create product with the given object', async () => {
    const sut = makeSut()
    const fakeCategory = new CategoryModel({
      name: 'valid_name'
    })
    await fakeCategory.save()

    const validProduct = {
      name: 'valid_name',
      price: 10.01,
      category_id: fakeCategory._id,
      imagePath: 'valid_image_path'
    }
    const product = await sut.create(validProduct)
    expect({
      name: product.name,
      price: product.price,
      category_id: product.category_id,
      imagePath: product.imagePath
    }).toEqual(validProduct)
    expect(product._id).toEqual(expect.anything())
  })
})
