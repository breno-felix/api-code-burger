const { Router } = require('express')
const fg = require('fast-glob')

const router = new Router()

fg.sync('**/src/main/routes/**routes.js').forEach((file) =>
  require(`../../../${file}`)(router)
)

module.exports = router
