const yup = require('yup')

module.exports = yup.object().shape({
  name: yup.string(),
  price: yup.number(),
  category_id: yup.string(),
  offer: yup.boolean()
})
