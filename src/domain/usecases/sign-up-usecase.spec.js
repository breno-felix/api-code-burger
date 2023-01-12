const { MissingParamServerError } = require('../../utils/errors')

class SignUpUseCase {
  constructor({ loadUserByEmailRepository } = {}) {
    this.loadUserByEmailRepository = loadUserByEmailRepository
  }

  async signUp(httpRequest) {
    if (!httpRequest) {
      throw new MissingParamServerError('httpRequest')
    }
    await this.loadUserByEmailRepository.load(httpRequest.email)
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
  loadUserByEmailRepositorySpy.user = {
    id: 'any_id',
    password: 'hashed_password'
  }
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

const makeSut = () => {
  const loadUserByEmailRepositorySpy = makeLoadUserByEmailRepository()

  const sut = new SignUpUseCase({
    loadUserByEmailRepository: loadUserByEmailRepositorySpy
  })

  return {
    sut,
    loadUserByEmailRepositorySpy
  }
}

describe('Sign up UseCase', () => {
  test('Should throw new MissingParamServerError if no httpRequest is provided', async () => {
    const { sut } = makeSut()
    expect(sut.signUp()).rejects.toThrow(
      new MissingParamServerError('httpRequest')
    )
  })

  test('Should call LoadUserByEmailRepository with correct email', async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSut()
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
    expect(loadUserByEmailRepositorySpy.email).toBe(httpRequest.body.email)
  })
})
