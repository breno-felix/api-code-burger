const yup = require('yup')

module.exports = yup.object().shape({
  products: yup
    .array()
    .required()
    .of(
      yup.object().shape({
        product_id: yup.string().required(),
        quantity: yup.number().required().positive().integer()
      })
    )
})
