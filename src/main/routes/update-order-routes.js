const { adapt } = require('../adapters/express-router-adapter')
const UpdateOrderRouterComposer = require('../composers/order/update-order-router-composer')
const multerMiddleware = require('../middlewares/multer')
const authMiddleware = require('../middlewares/auth')
const authAdminMiddleware = require('../middlewares/authAdmin')

module.exports = (router) => {
  const updateOrderRouter = UpdateOrderRouterComposer.compose()
  router.patch(
    '/update-order/:order_id',
    authMiddleware,
    authAdminMiddleware,
    multerMiddleware,
    adapt(updateOrderRouter)
  )
}
