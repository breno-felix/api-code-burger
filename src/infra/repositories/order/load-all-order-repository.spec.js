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
})
