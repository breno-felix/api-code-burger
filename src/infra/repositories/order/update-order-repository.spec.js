const UpdateOrderRepository = require('./update-order-repository')
const MongooseHelper = require('../../helpers/mongoose-helper')
const env = require('../../../main/config/envfile')
const OrderModel = require('../../entities/OrderModel')
const UserModel = require('../../entities/UserModel')
const CategoryModel = require('../../entities/CategoryModel')
const ProductModel = require('../../entities/ProductModel')
const { MissingParamServerError } = require('../../../utils/errors')

const makeSut = () => {
  return new UpdateOrderRepository(OrderModel)
}

describe('UpdateOrder Repository', () => {
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

  test('Should update order with the given object', async () => {
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

    const orderObjectToUpdate = {
      status: 'other_name',
      order_id: fakeOrder._id
    }
    await sut.update(orderObjectToUpdate)
    const updatedOrder = await OrderModel.find({})
    expect({
      status: updatedOrder[0].status,
      order_id: fakeOrder._id
    }).toEqual(orderObjectToUpdate)
  })

  test('Should throw if no orderModel is provided', async () => {
    const sut = new UpdateOrderRepository()
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

    const orderObjectToUpdate = {
      status: 'other_name',
      order_id: fakeOrder._id
    }
    const promise = sut.update(orderObjectToUpdate)
    expect(promise).rejects.toThrow()
  })

  test('Should throw if no orderObject is provided', async () => {
    const sut = makeSut()
    expect(sut.update()).rejects.toThrow(
      new MissingParamServerError('orderObject')
    )
  })
})
