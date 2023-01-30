class LoadAllOrderRepository {
  constructor(orderModel) {
    this.orderModel = orderModel
  }

  async load() {
    const orders = await this.orderModel.find()
    return orders
  }
}

const MongooseHelper = require('../../helpers/mongoose-helper')
const env = require('../../../main/config/envfile')
const OrderModel = require('../../entities/OrderModel')

const makeSut = () => {
  return new LoadAllOrderRepository(OrderModel)
}

describe('Load All Order Repository', () => {
  beforeAll(async () => {
    await MongooseHelper.connect(env.urlMongooseTest)
  })

  afterEach(async () => {
    await OrderModel.deleteMany()
  })

  afterAll(async () => {
    await MongooseHelper.disconnect()
  })

  test('Should return empty array if no orders is found', async () => {
    const sut = makeSut()
    const orders = await sut.load()
    expect(orders).toStrictEqual([])
  })

  test('Should return orders if orders is found', async () => {
    const sut = makeSut()
    const fakeOrder = new OrderModel({
      user_id: '63d6a6f028b2aec497a3146c',
      products: [
        {
          product_id: '63d6a6f028b2aec497a3146c',
          quantity: 1
        }
      ]
    })
    await fakeOrder.save()
    const fakeOrderTwo = new OrderModel({
      user_id: '62d6a6f028b2aec497a3146c',
      products: [
        {
          product_id: '62d6a6f028b2aec497a3146c',
          quantity: 2
        }
      ]
    })
    await fakeOrderTwo.save()
    const orders = await sut.load()
    expect(orders[0]._id).toEqual(fakeOrder._id)
    expect(orders[1]._id).toEqual(fakeOrderTwo._id)
    expect(orders.length).toEqual(2)
  })

  test('Should throw if no OrderModel is provided', async () => {
    const sut = new LoadAllOrderRepository()
    const promise = sut.load()
    expect(promise).rejects.toThrow()
  })
})
