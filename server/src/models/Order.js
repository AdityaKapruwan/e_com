import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    lineTotal: { type: Number, required: true },
  },
  { _id: false },
)

const orderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, default: '' },
    email: { type: String, required: true },
    address: { type: String, default: '' },
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true },
  },
  {
    timestamps: true,
    _id: true,
  },
)

orderSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    ret.createdAt = ret.createdAt?.toISOString?.() ?? ret.createdAt
    ret.updatedAt = ret.updatedAt?.toISOString?.() ?? ret.updatedAt
    delete ret.__v
    return ret
  },
})

export const Order = mongoose.model('Order', orderSchema)
