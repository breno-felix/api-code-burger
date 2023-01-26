class NewProductUseCase {
  async record(httpRequest) {
    if (!httpRequest) {
      throw new MissingParamServerError('httpRequest')
    }
  }
}

const { MissingParamServerError } = require('../../utils/errors')

const makeSut = () => {
  const sut = new NewProductUseCase()

  return {
    sut
  }
}

describe('New Product UseCase', () => {
  test('Should throw new MissingParamServerError if no httpRequest is provided', async () => {
    const { sut } = makeSut()
    expect(sut.record()).rejects.toThrow(
      new MissingParamServerError('httpRequest')
    )
  })
})
