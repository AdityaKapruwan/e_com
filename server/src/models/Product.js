import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    category: { type: String, required: true, index: true },
    image: { type: String, default: '' },
    stock: { type: Number, required: true, min: 0 },
  },
  {},
)

productSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.__v
    return ret
  },
})

export const Product = mongoose.model('Product', productSchema)
