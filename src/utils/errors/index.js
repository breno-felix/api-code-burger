const MissingParamError = require('./missing-param-error')
const InvalidParamError = require('./invalid-param-error')
const RepeatPasswordError = require('./repeat-password-error')
const RepeatedEmailError = require('./repeated-email-error')
const RepeatedNameError = require('./repeated-name-error')
const MissingParamServerError = require('./missing-param-server-error')

module.exports = {
  MissingParamError,
  InvalidParamError,
  RepeatPasswordError,
  RepeatedEmailError,
  MissingParamServerError,
  RepeatedNameError
}
