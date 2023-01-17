module.exports = class RepeatPasswordError extends Error {
  constructor() {
    super(`repeatPassword must be equal to password`)
    this.name = 'RepeatPasswordError'
  }
}
