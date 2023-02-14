const routes = require('./routes')
const express = require('express')
const path = require('path')
const swaggerUi = require('swagger-ui-express')
const swaggerDocs = require('../documentation/swagger.js')
class App {
  constructor() {
    this.app = express()

    this.middlewares()
    this.routes()
  }

  middlewares() {
    this.app.use(express.json())
    this.app.use(
      '/file',
      express.static(path.resolve(__dirname, '..', '..', '..', 'uploads'))
    )
    this.app.use(
      '/documentation',
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocs)
    )
  }

  routes() {
    this.app.use('/api', routes)
  }
}

module.exports = new App().app
