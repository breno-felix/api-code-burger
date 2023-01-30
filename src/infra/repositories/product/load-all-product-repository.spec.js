const LoadAllProductRepository = require('./load-all-product-repository')
const MongooseHelper = require('../../helpers/mongoose-helper')
const env = require('../../../main/config/envfile')
const ProductModel = require('../../entities/ProductModel')

const makeSut = () => {
  return new LoadAllProductRepository(ProductModel)
}

describe('Load All Product Repository', () => {
  beforeAll(async () => {
    await MongooseHelper.connect(env.urlMongooseTest)
  })

  afterEach(async () => {
    await ProductModel.deleteMany()
  })

  afterAll(async () => {
    await MongooseHelper.disconnect()
  })

  test('Should return empty array if no products is found', async () => {
    const sut = makeSut()
    const products = await sut.load()
    expect(products).toStrictEqual([])
  })

  test('Should return products if products is found', async () => {
    const sut = makeSut()
    const fakeProduct = new ProductModel({
      name: 'any_name',
      price: 10.01,
      category_id: '62d6a6f028b2aec497a3146c',
      imagePath: 'any_name'
    })
    await fakeProduct.save()
    const fakeProductTwo = new ProductModel({
      name: 'some_name',
      price: 10.02,
      category_id: '62d6a6f028b2aec497a3146c',
      imagePath: 'some_name'
    })
    await fakeProductTwo.save()
    const products = await sut.load()
    expect(products[0]._id).toEqual(fakeProduct._id)
    expect(products[1]._id).toEqual(fakeProductTwo._id)
    expect(products.length).toEqual(2)
  })

  test('Should throw if no ProductModel is provided', async () => {
    const sut = new LoadAllProductRepository()
    const promise = sut.load()
    expect(promise).rejects.toThrow()
  })
})
