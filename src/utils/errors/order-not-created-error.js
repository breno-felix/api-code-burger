module.exports = class OrderNotCreatedError extends Error {
  constructor() {
    super(`order_id must exist in order database`)
    this.name = 'OrderNotCreatedError'
  }
}
