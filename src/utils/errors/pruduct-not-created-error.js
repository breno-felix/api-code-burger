module.exports = class ProductNotCreatedError extends Error {
  constructor() {
    super(`product_id must exist in product database`)
    this.name = 'ProductNotCreatedError'
  }
}
