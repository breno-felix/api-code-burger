module.exports = class MissingParamServerError extends Error {
  constructor(paramName) {
    super(`Missing param: ${paramName}`)
    this.name = 'MissingParamServerError'
  }
}
