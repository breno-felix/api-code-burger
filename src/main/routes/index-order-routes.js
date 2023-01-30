const { adapt } = require('../adapters/express-router-adapter')
const IndexOrderRouterComposer = require('../composers/index-order-router-composer')
const authMiddleware = require('../middlewares/auth')

module.exports = (router) => {
  const indexOrderRouter = IndexOrderRouterComposer.compose()
  router.get('/index-order', authMiddleware, adapt(indexOrderRouter))
}
