class NewOrderUseCase {
  async record(httpRequest) {
    if (!httpRequest) {
      throw new MissingParamServerError('httpRequest')
    }
  }
}

const { MissingParamServerError } = require('../../utils/errors')

const makeSut = () => {
  const sut = new NewOrderUseCase()

  return {
    sut
  }
}

describe('New Order UseCase', () => {
  test('Should throw new MissingParamServerError if no httpRequest is provided', async () => {
    const { sut } = makeSut()
    expect(sut.record()).rejects.toThrow(
      new MissingParamServerError('httpRequest')
    )
  })
})
