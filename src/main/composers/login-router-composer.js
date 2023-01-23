const LoginRouter = require('../../presentation/routers/login-router')
const AuthUseCase = require('../../domain/usecases/auth-usecase')
const EmailValidator = require('../../utils/helpers/email-validator')
const LoadUserByEmailRepository = require('../../infra/repositories/user/load-user-by-email-repository')
const UpdateAccessTokenRepository = require('../../infra/repositories/user/update-access-token-repository')
const Encrypter = require('../../utils/helpers/encrypter')
const TokenGenerator = require('../../utils/helpers/token-generator')
const env = require('../config/envfile')
const userModel = require('../../infra/entities/UserModel')

module.exports = class LoginRouterComposer {
  static compose() {
    const loadUserByEmailRepository = new LoadUserByEmailRepository(userModel)
    const updateAccessTokenRepository = new UpdateAccessTokenRepository(
      userModel
    )
    const encrypter = new Encrypter()
    const tokenGenerator = new TokenGenerator({
      secret: env.secret,
      expiresIn: env.expiresIn
    })
    const authUseCase = new AuthUseCase({
      loadUserByEmailRepository,
      updateAccessTokenRepository,
      encrypter,
      tokenGenerator
    })
    const emailValidator = new EmailValidator()
    return new LoginRouter({
      authUseCase,
      emailValidator
    })
  }
}
