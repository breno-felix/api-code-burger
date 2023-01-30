const { adapt } = require('../adapters/express-router-adapter')
const IndexCategoryRouterComposer = require('../composers/category/index-category-router-composer')
const authMiddleware = require('../middlewares/auth')

module.exports = (router) => {
  const indexCategoryRouter = IndexCategoryRouterComposer.compose()
  router.get('/index-category', authMiddleware, adapt(indexCategoryRouter))
}
