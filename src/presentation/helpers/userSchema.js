const yup = require('yup')

module.exports = yup.object().shape({
  name: yup.string().required(),
  email: yup.string().email().required(),
  password: yup.string().required().min(6),
  repeatPassword: yup.ref('password'),
  admin: yup.boolean()
})
