class SignUpRouter {
  route(httpRequest) {
    if (!httpRequest.body.email || !httpRequest.body.password) {
      return {
        statusCode: 400
      }
    }
  }
}

const makeSut = () => {
  const sut = new SignUpRouter()
  return {
    sut
  }
}

describe('Sign Up Router', () => {
  test('Should return 400 if no email is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'any_name',
        password: 'any_password',
        repeatPassword: 'any_password',
        admin: false
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    // expect(httpResponse.body.error).toBe(new MissingParamError('email').message)
  })

  test('Should return 400 if no password is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        repeatPassword: 'any_password',
        admin: false
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    // expect(httpResponse.body.error).toBe(new MissingParamError('email').message)
  })
})
