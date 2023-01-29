const CreateOrderRepository = require('./create-order-repository')
const MongooseHelper = require('../../helpers/mongoose-helper')
const env = require('../../../main/config/envfile')
const OrderModel = require('../../entities/OrderModel')
const UserModel = require('../../entities/UserModel')
const CategoryModel = require('../../entities/CategoryModel')
const ProductModel = require('../../entities/ProductModel')
const { MissingParamServerError } = require('../../../utils/errors')

const makeSut = () => {
  return new CreateOrderRepository(OrderModel)
}

describe('CreateOrder Repository', () => {
  beforeAll(async () => {
    await MongooseHelper.connect(env.urlMongooseTest)
    await UserModel.deleteMany()
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

  test('Should create order with the given object', async () => {
    const sut = makeSut()
    const fakeUser = new UserModel({
      name: 'valid_name',
      email: 'valid_email@mail.com',
      password: 'valid_password',
      admin: false
    })
    await fakeUser.save()
    const fakeCategory = new CategoryModel({
      name: 'valid_name'
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

    const validOrder = {
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
    }
    const order = await sut.create(validOrder)
    expect({
      user_id: order.user_id,
      products: [
        {
          product_id: order.products[0].product_id,
          quantity: order.products[0].quantity
        },
        {
          product_id: order.products[1].product_id,
          quantity: order.products[1].quantity
        }
      ]
    }).toEqual(validOrder)
    expect(order._id).toEqual(expect.anything())
  })

  test('Should create order with the status param with some value by default', async () => {
    const sut = makeSut()

    const fakeUser = new UserModel({
      name: 'valid_name',
      email: 'valid_email@mail.com',
      password: 'valid_password',
      admin: false
    })
    await fakeUser.save()
    const fakeCategory = new CategoryModel({
      name: 'valid_name'
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

    const validOrder = {
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
    }
    const order = await sut.create(validOrder)
    expect(order.status).toBe('Pedido realizado')
  })

  test('Should throw if no orderModel is provided', async () => {
    const sut = new CreateOrderRepository()
    const fakeUser = new UserModel({
      name: 'valid_name',
      email: 'valid_email@mail.com',
      password: 'valid_password',
      admin: false
    })
    await fakeUser.save()
    const fakeCategory = new CategoryModel({
      name: 'valid_name'
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

    const validOrder = {
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
    }
    const promise = sut.create(validOrder)
    expect(promise).rejects.toThrow()
  })

  test('Should throw if no orderObject is provided', async () => {
    const sut = makeSut()
    expect(sut.create()).rejects.toThrow(
      new MissingParamServerError('orderObject')
    )
  })
})
