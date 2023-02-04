const { adapt } = require('../adapters/express-router-adapter')
const UpdateCategoryRouterComposer = require('../composers/category/update-category-router-composer')
const multerMiddleware = require('../middlewares/multer')
const authMiddleware = require('../middlewares/auth')
const authAdminMiddleware = require('../middlewares/authAdmin')

module.exports = (router) => {
  const updateCategoryRouter = UpdateCategoryRouterComposer.compose()
  router.put(
    '/update-category/:category_id',
    authMiddleware,
    authAdminMiddleware,
    multerMiddleware,
    adapt(updateCategoryRouter)
  )
}
