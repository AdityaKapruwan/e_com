/**
 * Load products from data/products.json into MongoDB.
 * Run from server folder: npm run seed
 * Replace existing products: npm run seed -- --force
 */
import dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import mongoose from 'mongoose'
import { connectDb } from './db.js'
import { Product } from './models/Product.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env') })

const force = process.argv.includes('--force')

async function main() {
  await connectDb()
  console.log(`Database: "${mongoose.connection.name}"`)

  if (force) {
    const deleted = await Product.deleteMany({})
    console.log(`Removed ${deleted.deletedCount} existing product(s) (--force)`)
  } else {
    const n = await Product.countDocuments()
    if (n > 0) {
      console.log(
        `Products collection already has ${n} document(s). Nothing imported.`,
      )
      console.log('To replace all products, run: npm run seed -- --force')
      await mongoose.disconnect()
      process.exit(0)
    }
  }

  const productsPath = join(__dirname, '..', 'data', 'products.json')
  const items = JSON.parse(readFileSync(productsPath, 'utf8'))
  await Product.insertMany(items)
  console.log(`Inserted ${items.length} products. Refresh MongoDB Compass.`)
  await mongoose.disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
