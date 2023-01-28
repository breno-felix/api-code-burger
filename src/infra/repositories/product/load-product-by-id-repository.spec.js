class LoadProductByIdRepository {
  constructor(productModel) {
    this.productModel = productModel
  }

  async load(id) {
    const product = await this.productModel.findOne({ _id: id })
    return product
  }
}

const MongooseHelper = require('../../helpers/mongoose-helper')
const env = require('../../../main/config/envfile')
const ProductModel = require('../../entities/ProductModel')

const makeSut = () => {
  return new LoadProductByIdRepository(ProductModel)
}

describe('LoadProductById Repository', () => {
  beforeAll(async () => {
    await MongooseHelper.connect(env.urlMongooseTest)
  })

  afterEach(async () => {
    await ProductModel.deleteMany()
  })

  afterAll(async () => {
    await MongooseHelper.disconnect()
  })

  test('Should return null if no product is found', async () => {
    const sut = makeSut()
    const product = await sut.load('63d26841431c2ca8e12c2832')
    expect(product).toBeNull()
  })
})
