const { adapt } = require('../adapters/express-router-adapter')
const NewOrderRouterComposer = require('../composers/new-order-router-composer')
const authMiddleware = require('../middlewares/auth')

module.exports = (router) => {
  const newOrderRouter = NewOrderRouterComposer.compose()
  router.post('/new-order', authMiddleware, adapt(newOrderRouter))
}
