const {
  MissingParamServerError,
  RepeatedEmailError,
  RepeatPasswordError
} = require('../../utils/errors')

class SignUpUseCase {
  constructor({ loadUserByEmailRepository, encrypter } = {}) {
    this.loadUserByEmailRepository = loadUserByEmailRepository
    this.encrypter = encrypter
  }

  async signUp(httpRequest) {
    if (!httpRequest) {
      throw new MissingParamServerError('httpRequest')
    }
    const user = await this.loadUserByEmailRepository.load(httpRequest.email)

    if (httpRequest.repeatPassword !== httpRequest.password) {
      throw new RepeatPasswordError()
    }

    if (user) {
      throw new RepeatedEmailError()
    }

    this.encrypter.hash(httpRequest.password)
  }
}

const makeSut = () => {
  const loadUserByEmailRepositorySpy = makeLoadUserByEmailRepository()
  const encrypterSpy = makeEncrypter()

  const sut = new SignUpUseCase({
    loadUserByEmailRepository: loadUserByEmailRepositorySpy,
    encrypter: encrypterSpy
  })

  return {
    sut,
    loadUserByEmailRepositorySpy,
    encrypterSpy
  }
}

const makeLoadUserByEmailRepository = () => {
  class LoadUserByEmailRepositorySpy {
    async load(email) {
      this.email = email
      return this.user
    }
  }
  const loadUserByEmailRepositorySpy = new LoadUserByEmailRepositorySpy()
  loadUserByEmailRepositorySpy.user = null
  return loadUserByEmailRepositorySpy
}

const makeLoadUserByEmailRepositoryWithError = () => {
  class LoadUserByEmailRepositorySpy {
    async load() {
      throw new Error()
    }
  }
  return new LoadUserByEmailRepositorySpy()
}

const makeEncrypter = () => {
  class EncrypterSpy {
    async hash(password) {
      this.password = password
      return this.hashedPassword
    }
  }
  const encrypterSpy = new EncrypterSpy()
  encrypterSpy.hashedPassword = 'hashed_password'
  return encrypterSpy
}
const makeEncrypterWithError = () => {
  class EncrypterSpy {
    async hash() {
      throw new Error()
    }
  }
  return new EncrypterSpy()
}

describe('Sign up UseCase', () => {
  test('Should throw new MissingParamServerError if no httpRequest is provided', async () => {
    const { sut } = makeSut()
    expect(sut.signUp()).rejects.toThrow(
      new MissingParamServerError('httpRequest')
    )
  })

  test('Should throw a new RepeatPasswordError if repeatPassword does not match the password', async () => {
    const { sut } = makeSut()

    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'valid_email@mail.com',
        password: 'any_password',
        repeatPassword: 'any_other_password',
        admin: false
      }
    }

    expect(sut.signUp(httpRequest.body)).rejects.toThrow(
      new RepeatPasswordError()
    )
  })

  test('Should call LoadUserByEmailRepository with correct email', async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSut()

    const validateSyncSpy = jest.spyOn(loadUserByEmailRepositorySpy, 'load')

    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password',
        repeatPassword: 'any_password',
        admin: false
      }
    }
    await sut.signUp(httpRequest.body)
    expect(validateSyncSpy).toHaveBeenCalledWith(httpRequest.body.email)
  })

  test('Should throw new RepeatedEmailError if email provided already exists', async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSut()
    loadUserByEmailRepositorySpy.user = {
      id: 'any_id'
    }
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'invalid_email@mail.com',
        password: 'any_password',
        repeatPassword: 'any_password',
        admin: false
      }
    }

    expect(sut.signUp(httpRequest.body)).rejects.toThrow(
      new RepeatedEmailError()
    )
  })

  test('Should call Encrypter with correct password', async () => {
    const { sut, encrypterSpy } = makeSut()

    const validateSyncSpy = jest.spyOn(encrypterSpy, 'hash')

    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'valid_email@mail.com',
        password: 'valid_password',
        repeatPassword: 'valid_password',
        admin: false
      }
    }

    await sut.signUp(httpRequest.body)
    expect(validateSyncSpy).toHaveBeenCalledWith(httpRequest.body.password)
  })
})
