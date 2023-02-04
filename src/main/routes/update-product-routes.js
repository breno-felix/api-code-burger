const { adapt } = require('../adapters/express-router-adapter')
const UpdateProductRouterComposer = require('../composers/product/update-product-router-composer')
const multerMiddleware = require('../middlewares/multer')
const authMiddleware = require('../middlewares/auth')
const authAdminMiddleware = require('../middlewares/authAdmin')

module.exports = (router) => {
  const updateCategoryRouter = UpdateProductRouterComposer.compose()
  router.put(
    '/update-product/:product_id',
    authMiddleware,
    authAdminMiddleware,
    multerMiddleware,
    adapt(updateCategoryRouter)
  )
}
