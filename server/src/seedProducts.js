import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { Product } from './models/Product.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export async function seedProductsIfEmpty() {
  const count = await Product.countDocuments()
  if (count > 0) return { seeded: false, count }

  const productsPath = join(__dirname, '..', 'data', 'products.json')
  const raw = readFileSync(productsPath, 'utf8')
  const items = JSON.parse(raw)
  await Product.insertMany(items)
  return { seeded: true, count: items.length }
}
