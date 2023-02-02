const { adapt } = require('../adapters/express-router-adapter')
const NewCategoryRouterComposer = require('../composers/category/new-category-router-composer')
const multerMiddleware = require('../middlewares/multer')
const authMiddleware = require('../middlewares/auth')
const authAdminMiddleware = require('../middlewares/authAdmin')

module.exports = (router) => {
  const newCategoryRouter = NewCategoryRouterComposer.compose()
  router.post(
    '/new-category',
    authMiddleware,
    authAdminMiddleware,
    multerMiddleware,
    adapt(newCategoryRouter)
  )
}
