const MongooseHelper = require('../helpers/mongoose-helper')

const orderSchema = MongooseHelper.newSchema({
  user_id: {
    type: MongooseHelper.getObjectId(),
    ref: 'User',
    required: true
  },
  products: [
    {
      product_id: {
        type: MongooseHelper.getObjectId(),
        ref: 'Product',
        required: true
      },
      quantity: { type: Number, required: true, min: 0 }
    }
  ],
  status: { type: String, required: true, default: 'Pedido realizado' }
})

orderSchema.set('timestamps', true)

module.exports = MongooseHelper.newModel('Order', orderSchema)
