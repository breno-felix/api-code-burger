module.exports = class CategoryNotCreatedError extends Error {
  constructor() {
    super(`category_id must exist in category database`)
    this.name = 'CategoryNotCreatedError'
  }
}
