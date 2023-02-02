const LoadProductByIdRepository = require('./load-product-by-id-repository')
const MongooseHelper = require('../../helpers/mongoose-helper')
const env = require('../../../main/config/envfile')
const ProductModel = require('../../entities/ProductModel')
const CategoryModel = require('../../entities/CategoryModel')
const { MissingParamServerError } = require('../../../utils/errors')

const makeSut = () => {
  return new LoadProductByIdRepository(ProductModel)
}

describe('LoadProductById Repository', () => {
  beforeAll(async () => {
    await MongooseHelper.connect(env.urlMongooseTest)
  })

  afterEach(async () => {
    await ProductModel.deleteMany()
    await CategoryModel.deleteMany()
  })

  afterAll(async () => {
    await MongooseHelper.disconnect()
  })

  test('Should return null if no product is found', async () => {
    const sut = makeSut()
    const product = await sut.load('63d26841431c2ca8e12c2832')
    expect(product).toBeNull()
  })

  test('Should return an product if product is found', async () => {
    const sut = makeSut()
    const fakeCategory = new CategoryModel({
      name: 'valid_name',
      imagePath: 'any_name'
    })
    await fakeCategory.save()
    const fakeProduct = new ProductModel({
      name: 'valid_name',
      price: 10.01,
      category_id: fakeCategory._id,
      imagePath: 'valid_image_path'
    })
    await fakeProduct.save()
    const product = await sut.load(fakeProduct._id)
    expect(product._id).toEqual(fakeProduct._id)
  })

  test('Should throw if no ProductModel is provided', async () => {
    const sut = new LoadProductByIdRepository()
    const promise = sut.load('63d26841431c2ca8e12c2832')
    expect(promise).rejects.toThrow()
  })

  test('Should throw if no id is provided', async () => {
    const sut = makeSut()
    const promise = sut.load()
    expect(promise).rejects.toThrow(new MissingParamServerError('id'))
  })
})
