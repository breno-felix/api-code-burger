const yup = require('yup')

module.exports = yup.object().shape({
  name: yup.string()
})
