const SignUpRouter = require('./sign-up-router')
const { ServerError } = require('../errors')
const {
  MissingParamError,
  RepeatPasswordError,
  RepeatedEmailError,
  InvalidParamError
} = require('../../utils/errors')

const makeSut = () => {
  const signUpUseCaseSpy = makeSignUpUseCase()
  const userObjectShapeValidatorSpy = makeUserObjectShapeValidator()

  const sut = new SignUpRouter({
    signUpUseCase: signUpUseCaseSpy,
    userObjectShapeValidator: userObjectShapeValidatorSpy
  })

  return {
    sut,
    signUpUseCaseSpy,
    userObjectShapeValidatorSpy
  }
}

const makeSignUpUseCase = () => {
  class SignUpUseCaseSpy {
    async signUp(name, email, password, repeatPassword, admin) {
      this.name = name
      this.email = email
      this.password = password
      this.repeatPassword = repeatPassword
      this.admin = admin
      return this.isRegistered
    }
  }
  const signUpUseCaseSpy = new SignUpUseCaseSpy()
  signUpUseCaseSpy.isRegistered = true
  return signUpUseCaseSpy
}

const makeSignUpUseCaseWithRepeatPasswordError = () => {
  class SignUpUseCaseSpy {
    async signUp() {
      throw new RepeatPasswordError()
    }
  }
  return new SignUpUseCaseSpy()
}

const makeSignUpUseCaseWithRepeatedEmailError = () => {
  class SignUpUseCaseSpy {
    async signUp() {
      throw new RepeatedEmailError()
    }
  }
  return new SignUpUseCaseSpy()
}

const makeSignUpUseCaseWithError = () => {
  class SignUpUseCaseSpy {
    async signUp() {
      throw new Error()
    }
  }
  return new SignUpUseCaseSpy()
}

const makeUserObjectShapeValidator = () => {
  class UserObjectShapeValidatorSpy {
    async isValid(httpRequest) {
      this.httpRequest = httpRequest
    }
  }

  const userObjectShapeValidatorSpy = new UserObjectShapeValidatorSpy()
  return userObjectShapeValidatorSpy
}

const makeUserObjectShapeValidatorWithInvalidParamError = () => {
  class UserObjectShapeValidatorSpy {
    async isValid() {
      throw new InvalidParamError('description of some invalid parameter')
    }
  }
  return new UserObjectShapeValidatorSpy()
}

const makeUserObjectShapeValidatorWithError = () => {
  class UserObjectShapeValidatorSpy {
    async isValid() {
      throw new Error()
    }
  }
  return new UserObjectShapeValidatorSpy()
}

const requiredParams = ['name', 'email', 'password', 'repeatPassword']
const invalidRequests = [undefined, {}]

describe('Sign Up Router', () => {
  requiredParams.forEach((param) => {
    test(`Should return 400 if no ${param} is provided`, async () => {
      const { sut } = makeSut()
      const httpRequest = {
        body: {
          name: 'any_name',
          email: 'any_email@mail.com',
          password: 'any_password',
          repeatPassword: 'any_password',
          admin: false
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

  test('Should call SignUpUseCase with correct params', async () => {
    const { sut, signUpUseCaseSpy } = makeSut()
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password',
        repeatPassword: 'any_password',
        admin: false
      }
    }
    await sut.route(httpRequest)
    requiredParams.forEach((param) => {
      expect(signUpUseCaseSpy[param]).toBe(httpRequest.body[param])
    })
  })

  test('Should return 201 when valid params are provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password',
        repeatPassword: 'any_password',
        admin: false
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(201)
    expect(httpResponse.body).toBe(
      'The request was successful and a new resource was created as a result.'
    )
  })

  test('Should return 400 when repeatPassword other than password is provided', async () => {
    const userObjectShapeValidator = makeUserObjectShapeValidator()

    const sut = new SignUpRouter({
      signUpUseCase: makeSignUpUseCaseWithRepeatPasswordError(),
      userObjectShapeValidator
    })

    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password',
        repeatPassword: 'any_other_password',
        admin: false
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body.error).toBe(new RepeatPasswordError().message)
  })

  test('Should return 400 when email provided is not unique in user database', async () => {
    const userObjectShapeValidator = makeUserObjectShapeValidator()

    const sut = new SignUpRouter({
      signUpUseCase: makeSignUpUseCaseWithRepeatedEmailError(),
      userObjectShapeValidator
    })

    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'repeated_email@mail.com',
        password: 'any_password',
        repeatPassword: 'any_password',
        admin: false
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body.error).toBe(new RepeatedEmailError().message)
  })

  test('Should call userObjectShapeValidator with correct httpRequest', async () => {
    const { sut, userObjectShapeValidatorSpy } = makeSut()
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password',
        repeatPassword: 'any_password',
        admin: false
      }
    }
    await sut.route(httpRequest)
    expect(userObjectShapeValidatorSpy.httpRequest).toBe(httpRequest.body)
  })

  test('Should return 400 if an invalid param is provided', async () => {
    const signUpUseCase = makeSignUpUseCase()

    const sut = new SignUpRouter({
      signUpUseCase,
      userObjectShapeValidator:
        makeUserObjectShapeValidatorWithInvalidParamError()
    })

    const httpRequest = {
      body: {
        name: 'invalid_name',
        email: 'invalid_email@mail.com',
        password: 'invalid_password',
        repeatPassword: 'invalid_password',
        admin: 'anything other than boolean'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
  })

  test('Should return 500 if invalid dependencies are provided', async () => {
    const invalid = {}
    const signUpUseCase = makeSignUpUseCase()
    const suts = [].concat(
      new SignUpRouter(),
      new SignUpRouter({}),
      new SignUpRouter({
        signUpUseCase: invalid
      }),
      new SignUpRouter({
        signUpUseCase
      }),
      new SignUpRouter({
        signUpUseCase,
        userObjectShapeValidator: invalid
      })
    )
    for (const sut of suts) {
      const httpRequest = {
        body: {
          name: 'any_name',
          email: 'any_email@mail.com',
          password: 'any_password',
          repeatPassword: 'any_password',
          admin: false
        }
      }
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(500)
      expect(httpResponse.body.error).toBe(new ServerError().message)
    }
  })

  test('Should return 500 if any dependency throw a new Error()', async () => {
    const signUpUseCase = makeSignUpUseCase()
    const suts = [].concat(
      new SignUpRouter({
        signUpUseCase: makeSignUpUseCaseWithError()
      }),
      new SignUpRouter({
        signUpUseCase,
        userObjectShapeValidator: makeUserObjectShapeValidatorWithError()
      })
    )
    for (const sut of suts) {
      const httpRequest = {
        body: {
          name: 'any_name',
          email: 'any_email@mail.com',
          password: 'any_password',
          repeatPassword: 'any_password',
          admin: false
        }
      }
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(500)
      expect(httpResponse.body.error).toBe(new ServerError().message)
    }
  })
})
