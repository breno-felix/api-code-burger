const yup = require('yup')

module.exports = yup.object().shape({
  status: yup.string().required()
})
