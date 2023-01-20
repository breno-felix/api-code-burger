const { adapt } = require('../adapters/express-router-adapter')
const NewCategoryRouterComposer = require('../composers/new-category-router-composer')

module.exports = (router) => {
  const newCategoryRouter = NewCategoryRouterComposer.compose()
  router.post('/new-category', adapt(newCategoryRouter))
}
