const LoginRouter = require('./login-router')
const { UnauthorizedError, ServerError } = require('../errors')
const { MissingParamError, InvalidParamError } = require('../../utils/errors')

const makeSut = () => {
  const authUseCaseSpy = makeAuthUseCase()
  const emailValidatorSpy = makeEmailValidator()
  const sut = new LoginRouter({
    authUseCase: authUseCaseSpy,
    emailValidator: emailValidatorSpy
  })
  return {
    sut,
    authUseCaseSpy,
    emailValidatorSpy
  }
}

const makeEmailValidator = () => {
  class EmailValidatorSpy {
    isValid(email) {
      this.email = email
      return this.isEmailValid
    }
  }
  const emailValidatorSpy = new EmailValidatorSpy()
  emailValidatorSpy.isEmailValid = true
  return emailValidatorSpy
}

const makeEmailValidatorWithError = () => {
  class EmailValidatorSpy {
    isValid() {
      throw new Error()
    }
  }
  return new EmailValidatorSpy()
}

const makeAuthUseCase = () => {
  class AuthUseCaseSpy {
    async auth(email, password) {
      this.email = email
      this.password = password
      return this.accessToken
    }
  }

  const authUseCaseSpy = new AuthUseCaseSpy()
  authUseCaseSpy.accessToken = 'valid_token'
  return authUseCaseSpy
}

const makeAuthUseCaseWithError = () => {
  class AuthUseCaseSpy {
    async auth() {
      throw new Error()
    }
  }
  return new AuthUseCaseSpy()
}

const requiredParams = ['email', 'password']
const invalidRequests = [undefined, {}]

describe('Login Router', () => {
  requiredParams.forEach((param) => {
    test(`Should return 400 if no ${param} is provided`, async () => {
      const { sut } = makeSut()
      const httpRequest = {
        body: {
          email: 'any_email@mail.com',
          password: 'any_password'
        }
      }
      delete httpRequest.body[param]
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(400)
      expect(httpResponse.body.error).toBe(new MissingParamError(param).message)
    })
  })

  invalidRequests.forEach((httpRequest) => {
    test('Should return 500 if the httpRequest is invalid', async () => {
      const { sut } = makeSut()
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(500)
      expect(httpResponse.body.error).toBe(new ServerError().message)
    })
  })

  test('Should call AuthUseCase with correct params', async () => {
    const { sut, authUseCaseSpy } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }
    await sut.route(httpRequest)
    requiredParams.forEach((param) => {
      expect(authUseCaseSpy[param]).toBe(httpRequest.body[param])
    })
  })

  test('Should return 401 when invalid credintials are provided', async () => {
    const { sut, authUseCaseSpy } = makeSut()
    authUseCaseSpy.accessToken = null
    const httpRequest = {
      body: {
        email: 'invalid_email@mail.com',
        password: 'invalid_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(401)
    expect(httpResponse.body.error).toBe(new UnauthorizedError().message)
  })

  test('Should return 200 when valid credintials are provided', async () => {
    const { sut, authUseCaseSpy } = makeSut()
    const httpRequest = {
      body: {
        email: 'valid_email@mail.com',
        password: 'valid_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body.accessToken).toBe(authUseCaseSpy.accessToken)
  })

  test('Should return 400 if an invalid email is provided', async () => {
    const { sut, emailValidatorSpy } = makeSut()
    emailValidatorSpy.isEmailValid = false
    const httpRequest = {
      body: {
        email: 'invalid_email@mail.com',
        password: 'any_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body.error).toBe(new InvalidParamError('email').message)
  })

  test('Should call EmailValidator with correct email', async () => {
    const { sut, emailValidatorSpy } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }
    await sut.route(httpRequest)
    expect(emailValidatorSpy.email).toBe(httpRequest.body.email)
  })

  test('Should throw if invalid dependencies are provided', async () => {
    const invalid = {}
    const authUseCase = makeAuthUseCase()
    const suts = [].concat(
      new LoginRouter(),
      new LoginRouter({}),
      new LoginRouter({
        authUseCase: invalid
      }),
      new LoginRouter({
        authUseCase
      }),
      new LoginRouter({
        authUseCase,
        emailValidator: invalid
      })
    )
    for (const sut of suts) {
      const httpRequest = {
        body: {
          email: 'any_email@mail.com',
          password: 'any_password'
        }
      }
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(500)
      expect(httpResponse.body.error).toBe(new ServerError().message)
    }
  })

  test('Should throw if any dependency throws', async () => {
    const authUseCase = makeAuthUseCase()
    const suts = [].concat(
      new LoginRouter({
        authUseCase: makeAuthUseCaseWithError()
      }),
      new LoginRouter({
        authUseCase,
        emailValidator: makeEmailValidatorWithError()
      })
    )
    for (const sut of suts) {
      const httpRequest = {
        body: {
          email: 'any_email@mail.com',
          password: 'any_password'
        }
      }
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(500)
      expect(httpResponse.body.error).toBe(new ServerError().message)
    }
  })
})
