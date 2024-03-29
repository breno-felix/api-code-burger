const { adapt } = require('../adapters/express-router-adapter')
const NewProductRouterComposer = require('../composers/product/new-product-router-composer')
const multerMiddleware = require('../middlewares/multer')
const authMiddleware = require('../middlewares/auth')
const authAdminMiddleware = require('../middlewares/authAdmin')

module.exports = (router) => {
  const newCategoryRouter = NewProductRouterComposer.compose()
  router.post(
    '/new-product',
    authMiddleware,
    authAdminMiddleware,
    multerMiddleware,
    adapt(newCategoryRouter)
  )
}
