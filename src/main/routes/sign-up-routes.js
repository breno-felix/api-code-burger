const { adapt } = require('../adapters/express-router-adapter')
const SignUpRouterComposer = require('../composers/sign-up-router-composer')

module.exports = (router) => {
  const signUpRouter = SignUpRouterComposer.compose()
  router.post('/sign-up', adapt(signUpRouter))
}
