const yup = require('yup')

module.exports = yup.object().shape({
  name: yup.string().required(),
  price: yup.number().required(),
  category_id: yup.string().required()
})
