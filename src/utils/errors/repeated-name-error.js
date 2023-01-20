module.exports = class RepeatedNameError extends Error {
  constructor() {
    super(`name must be unique in category database`)
    this.name = 'RepeatedNameError'
  }
}
