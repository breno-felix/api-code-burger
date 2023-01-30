const { adapt } = require('../adapters/express-router-adapter')
const IndexProductRouterComposer = require('../composers/index-product-router-composer')
const authMiddleware = require('../middlewares/auth')

module.exports = (router) => {
  const indexProductRouter = IndexProductRouterComposer.compose()
  router.get('/index-product', authMiddleware, adapt(indexProductRouter))
}
