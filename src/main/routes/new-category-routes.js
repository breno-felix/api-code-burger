const { adapt } = require('../adapters/express-router-adapter')
const NewCategoryRouterComposer = require('../composers/category/new-category-router-composer')
const authMiddleware = require('../middlewares/auth')

module.exports = (router) => {
  const newCategoryRouter = NewCategoryRouterComposer.compose()
  router.post('/new-category', authMiddleware, adapt(newCategoryRouter))
}
