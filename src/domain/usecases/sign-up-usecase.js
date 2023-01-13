const {
  MissingParamServerError,
  RepeatedEmailError,
  RepeatPasswordError
} = require('../../utils/errors')

module.exports = class SignUpUseCase {
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
