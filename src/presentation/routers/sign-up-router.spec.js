class SignUpRouter {
  route(httpRequest) {
    if (!httpRequest || !httpRequest.body) {
      return {
        statusCode: 500
      }
    }
    const { name, email, password, repeatPassword } = httpRequest.body
    if (!email || !password || !name || !repeatPassword) {
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
  test('Should return 400 if no name is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password',
        repeatPassword: 'any_password',
        admin: false
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    // expect(httpResponse.body.error).toBe(new MissingParamError('email').message)
  })

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

  test('Should return 400 if no repeatPassword is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password',
        admin: false
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    // expect(httpResponse.body.error).toBe(new MissingParamError('email').message)
  })

  test('Should create user with admin false by default if no admin is provided', async () => {})

  test('Should return 500 if no httpRequest is provided', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.route()
    expect(httpResponse.statusCode).toBe(500)
    // expect(httpResponse.body.error).toBe(new MissingParamError('email').message)
  })

  test('Should return 500 if httpRequest has no body', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.route({})
    expect(httpResponse.statusCode).toBe(500)
    // expect(httpResponse.body.error).toBe(new MissingParamError('email').message)
  })
})
