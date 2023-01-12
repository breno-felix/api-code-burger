const {
  MissingParamServerError,
  RepeatedEmailError,
  RepeatPasswordError
} = require('../../utils/errors')

class SignUpUseCase {
  constructor({
    loadUserByEmailRepository,
    encrypter,
    createUserRepository
  } = {}) {
    this.loadUserByEmailRepository = loadUserByEmailRepository
    this.encrypter = encrypter
    this.createUserRepository = createUserRepository
  }

  async signUp(httpRequest) {
    if (!httpRequest) {
      throw new MissingParamServerError('httpRequest')
    }

    if (httpRequest.repeatPassword !== httpRequest.password) {
      throw new RepeatPasswordError()
    }

    const user = await this.loadUserByEmailRepository.load(httpRequest.email)

    if (user) {
      throw new RepeatedEmailError()
    }

    const hashedPassword = await this.encrypter.hash(httpRequest.password)
    await this.createUserRepository.create({
      name: httpRequest.name,
      email: httpRequest.email,
      password: hashedPassword,
      admin: httpRequest.admin
    })
  }
}

const makeSut = () => {
  const loadUserByEmailRepositorySpy = makeLoadUserByEmailRepository()
  const encrypterSpy = makeEncrypter()
  const createUserRepositorySpy = makeCreateUserRepository()

  const sut = new SignUpUseCase({
    loadUserByEmailRepository: loadUserByEmailRepositorySpy,
    encrypter: encrypterSpy,
    createUserRepository: createUserRepositorySpy
  })

  return {
    sut,
    loadUserByEmailRepositorySpy,
    encrypterSpy,
    createUserRepositorySpy
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

const makeCreateUserRepository = () => {
  class CreateUserRepositorySpy {
    async create({ name, email, password, admin }) {
      this.name = name
      this.email = email
      this.password = password
      this.admin = admin
    }
  }
  const createUserRepositorySpy = new CreateUserRepositorySpy()
  return createUserRepositorySpy
}

const makeCreateUserRepositoryWithError = () => {
  class CreateUserRepositorySpy {
    async create() {
      throw new Error()
    }
  }
  return new CreateUserRepositorySpy()
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

  test('Should call CreateUserRepository with correct values', async () => {
    const { sut, createUserRepositorySpy, encrypterSpy } = makeSut()

    const validateSyncSpy = jest.spyOn(createUserRepositorySpy, 'create')

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
    expect(validateSyncSpy).toHaveBeenCalledWith({
      name: httpRequest.body.name,
      email: httpRequest.body.email,
      password: encrypterSpy.hashedPassword,
      admin: httpRequest.body.admin
    })
  })

  test('Should throw if invalid dependencies are provided', async () => {
    const invalid = {}
    const loadUserByEmailRepository = makeLoadUserByEmailRepository()
    const encrypter = makeEncrypter()
    const suts = [].concat(
      new SignUpUseCase(),
      new SignUpUseCase({}),
      new SignUpUseCase({
        loadUserByEmailRepository: invalid
      }),
      new SignUpUseCase({
        loadUserByEmailRepository
      }),
      new SignUpUseCase({
        loadUserByEmailRepository,
        encrypter: invalid
      }),
      new SignUpUseCase({
        loadUserByEmailRepository,
        encrypter
      }),
      new SignUpUseCase({
        loadUserByEmailRepository,
        encrypter,
        createUserRepository: invalid
      })
    )
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'valid_email@mail.com',
        password: 'valid_password',
        repeatPassword: 'valid_password',
        admin: false
      }
    }
    for (const sut of suts) {
      const promise = sut.signUp(httpRequest.body)
      expect(promise).rejects.toThrow()
    }
  })

  test('Should throw if dependency throw', async () => {
    const loadUserByEmailRepository = makeLoadUserByEmailRepository()
    const encrypter = makeEncrypter()
    const suts = [].concat(
      new SignUpUseCase({
        loadUserByEmailRepository: makeLoadUserByEmailRepositoryWithError()
      }),
      new SignUpUseCase({
        loadUserByEmailRepository,
        encrypter: makeEncrypterWithError()
      }),
      new SignUpUseCase({
        loadUserByEmailRepository,
        encrypter,
        createUserRepository: makeCreateUserRepositoryWithError()
      })
    )
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'valid_email@mail.com',
        password: 'valid_password',
        repeatPassword: 'valid_password',
        admin: false
      }
    }
    for (const sut of suts) {
      const promise = sut.signUp(httpRequest)
      expect(promise).rejects.toThrow()
    }
  })
})
