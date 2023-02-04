const UpdateProductRepository = require('./update-product-repository')
const MongooseHelper = require('../../helpers/mongoose-helper')
const env = require('../../../main/config/envfile')
const ProductModel = require('../../entities/ProductModel')
const CategoryModel = require('../../entities/CategoryModel')
const { MissingParamServerError } = require('../../../utils/errors')

const makeSut = () => {
  return new UpdateProductRepository(ProductModel)
}

describe('Update Product Repository', () => {
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

  test('Should update product with the given object', async () => {
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

    const otherFakeCategory = new CategoryModel({
      name: 'other_valid_name',
      imagePath: 'any_name'
    })
    await otherFakeCategory.save()

    const productObjectToUpdate = {
      name: 'other_name',
      price: 10.05,
      offer: true,
      category_id: otherFakeCategory._id,
      imagePath: 'other_image_path',
      product_id: fakeProduct._id
    }

    await sut.update(productObjectToUpdate)
    const updatedProduct = await ProductModel.find({})
    expect({
      name: updatedProduct[0].name,
      price: updatedProduct[0].price,
      offer: updatedProduct[0].offer,
      category_id: updatedProduct[0].category_id,
      imagePath: updatedProduct[0].imagePath,
      product_id: fakeProduct._id
    }).toEqual(productObjectToUpdate)
  })

  test('Should throw if no productModel is provided', async () => {
    const sut = new UpdateProductRepository()
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

    const otherFakeCategory = new CategoryModel({
      name: 'other_valid_name',
      imagePath: 'any_name'
    })
    await otherFakeCategory.save()

    const productObjectToUpdate = {
      name: 'other_name',
      price: 10.05,
      offer: true,
      category_id: otherFakeCategory._id,
      imagePath: 'other_image_path',
      product_id: fakeProduct._id
    }

    const promise = sut.update(productObjectToUpdate)
    expect(promise).rejects.toThrow()
  })

  test('Should throw if no productObject is provided', async () => {
    const sut = makeSut()
    expect(sut.update()).rejects.toThrow(
      new MissingParamServerError('productObject')
    )
  })
})
