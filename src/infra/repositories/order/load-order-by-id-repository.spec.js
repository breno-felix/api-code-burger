const LoadOrderByIdRepository = require('./load-order-by-id-repository')
const MongooseHelper = require('../../helpers/mongoose-helper')
const env = require('../../../main/config/envfile')
const OrderModel = require('../../entities/OrderModel')
const UserModel = require('../../entities/UserModel')
const CategoryModel = require('../../entities/CategoryModel')
const ProductModel = require('../../entities/ProductModel')
const { MissingParamServerError } = require('../../../utils/errors')

const makeSut = () => {
  return new LoadOrderByIdRepository(OrderModel)
}

describe('LoadOrderById Repository', () => {
  beforeAll(async () => {
    await MongooseHelper.connect(env.urlMongooseTest)
  })

  afterEach(async () => {
    await OrderModel.deleteMany()
    await UserModel.deleteMany()
    await CategoryModel.deleteMany()
    await ProductModel.deleteMany()
  })

  afterAll(async () => {
    await MongooseHelper.disconnect()
  })

  test('Should return null if no order is found', async () => {
    const sut = makeSut()
    const order = await sut.load('63d26841431c2ca8e12c2832')
    expect(order).toBeNull()
  })

  test('Should return an order if order is found', async () => {
    const sut = makeSut()
    const fakeUser = new UserModel({
      name: 'valid_name',
      email: 'valid_email@mail.com',
      password: 'valid_password',
      admin: false
    })
    await fakeUser.save()
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

    const fakeProductTwo = new ProductModel({
      name: 'valid_name',
      price: 10.01,
      category_id: fakeCategory._id,
      imagePath: 'valid_image_path'
    })
    await fakeProductTwo.save()

    const fakeOrder = new OrderModel({
      user_id: fakeUser._id,
      products: [
        {
          product_id: fakeProduct._id,
          quantity: 1
        },
        {
          product_id: fakeProductTwo._id,
          quantity: 2
        }
      ]
    })
    await fakeOrder.save()
    const order = await sut.load(fakeOrder._id)
    expect(order._id).toEqual(fakeOrder._id)
  })

  test('Should throw if no OrderModel is provided', async () => {
    const sut = new LoadOrderByIdRepository()
    const promise = sut.load('63d26841431c2ca8e12c2832')
    expect(promise).rejects.toThrow()
  })

  test('Should throw if no id is provided', async () => {
    const sut = makeSut()
    const promise = sut.load()
    expect(promise).rejects.toThrow(new MissingParamServerError('id'))
  })
})
