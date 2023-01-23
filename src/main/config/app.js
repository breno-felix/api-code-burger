const routes = require('./routes')
const express = require('express')
const path = require('path')

class App {
  constructor() {
    this.app = express()

    this.middlewares()
    this.routes()
  }

  middlewares() {
    this.app.use(express.json())
    this.app.use(
      '/product-file',
      express.static(path.resolve(__dirname, '..', '..', '..', 'uploads'))
    )
  }

  routes() {
    this.app.use('/api', routes)
  }
}

module.exports = new App().app
