const { MissingParamServerError } = require('../../utils/errors')

class SignUpUseCase {
  async signUp(httpRequest) {
    if (!httpRequest) {
      throw new MissingParamServerError('httpRequest')
    }
  }
}

const makeSut = () => {
  const sut = new SignUpUseCase()

  return {
    sut
  }
}

describe('Sign up UseCase', () => {
  test('Should throw new MissingParamServerError if no httpRequest is provided', async () => {
    const { sut } = makeSut()
    expect(sut.signUp()).rejects.toThrow(
      new MissingParamServerError('httpRequest')
    )
  })
})
