const {
  MissingParamError,
  RepeatPasswordError,
  RepeatedEmailError
} = require('../../utils/errors')
const { ServerError } = require('../errors')
const SignUpRouter = require('./sign-up-router')

const makeSut = () => {
  const signUpUseCaseSpy = makeSignUpUseCase()

  const sut = new SignUpRouter({
    signUpUseCase: signUpUseCaseSpy
  })

  return {
    sut,
    signUpUseCaseSpy
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
    signUp() {
      throw new RepeatPasswordError()
    }
  }
  return new SignUpUseCaseSpy()
}

const makeSignUpUseCaseWithRepeatedEmailError = () => {
  class SignUpUseCaseSpy {
    signUp() {
      throw new RepeatedEmailError()
    }
  }
  return new SignUpUseCaseSpy()
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
    expect(httpResponse.body.error).toBe(new MissingParamError('name').message)
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
    expect(httpResponse.body.error).toBe(new MissingParamError('email').message)
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
    expect(httpResponse.body.error).toBe(
      new MissingParamError('password').message
    )
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
    expect(httpResponse.body.error).toBe(
      new MissingParamError('repeatPassword').message
    )
  })

  test('Should return 500 if no httpRequest is provided', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.route()
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body.error).toBe(new ServerError().message)
  })

  test('Should return 500 if httpRequest has no body', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.route({})
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body.error).toBe(new ServerError().message)
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
    expect(signUpUseCaseSpy.name).toBe(httpRequest.body.name)
    expect(signUpUseCaseSpy.email).toBe(httpRequest.body.email)
    expect(signUpUseCaseSpy.password).toBe(httpRequest.body.password)
    expect(signUpUseCaseSpy.repeatPassword).toBe(
      httpRequest.body.repeatPassword
    )
    expect(signUpUseCaseSpy.admin).toBe(httpRequest.body.admin)
  })

  test('Should throw if invalid dependencies are provided', async () => {
    const invalid = {}
    const signUpUseCase = makeSignUpUseCase()
    const suts = [].concat(
      new SignUpRouter(),
      new SignUpRouter({}),
      new SignUpRouter({
        signUpUseCase: invalid
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
    const signUpUseCaseSpy = makeSignUpUseCaseWithRepeatPasswordError()

    const sut = new SignUpRouter({
      signUpUseCase: signUpUseCaseSpy
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
    const signUpUseCaseSpy = makeSignUpUseCaseWithRepeatedEmailError()

    const sut = new SignUpRouter({
      signUpUseCase: signUpUseCaseSpy
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
})
