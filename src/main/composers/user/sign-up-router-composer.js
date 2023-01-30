const SignUpRouter = require('../../../presentation/routers/sign-up-router')
const SignUpUseCase = require('../../../domain/usecases/sign-up-usecase')
const LoadUserByEmailRepository = require('../../../infra/repositories/user/load-user-by-email-repository')
const Encrypter = require('../../../utils/helpers/encrypter')
const CreateUserRepository = require('../../../infra/repositories/user/create-user-repository')
const ObjectShapeValidator = require('../../../utils/helpers/object-shape-validator')
const env = require('../../config/envfile')
const userModel = require('../../../infra/entities/UserModel')
const yupUserSchema = require('../../../utils/helpers/yup-userSchema')

module.exports = class SignUpRouterComposer {
  static compose() {
    const loadUserByEmailRepository = new LoadUserByEmailRepository(userModel)
    const encrypter = new Encrypter(env.saltRounds)
    const createUserRepository = new CreateUserRepository(userModel)
    const signUpUseCase = new SignUpUseCase({
      loadUserByEmailRepository,
      encrypter,
      createUserRepository
    })
    const objectShapeValidator = new ObjectShapeValidator({
      yupSchema: yupUserSchema
    })
    return new SignUpRouter({
      signUpUseCase,
      objectShapeValidator
    })
  }
}
