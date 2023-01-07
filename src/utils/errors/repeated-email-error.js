module.exports = class RepeatedEmailError extends Error {
  constructor() {
    super(`email must be unique in user database`)
    this.name = 'RepeatedEmailError'
  }
}
