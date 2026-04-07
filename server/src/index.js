import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { randomUUID } from 'crypto'
import mongoose from 'mongoose'
import { connectDb, dbReady } from './db.js'
import { Product } from './models/Product.js'
import { Order } from './models/Order.js'
import { seedProductsIfEmpty } from './seedProducts.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env') })

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'ecommerce-api',
    database: dbReady() ? 'connected' : 'disconnected',
  })
})

app.get('/api/products', async (req, res) => {
  try {
    const { category } = req.query
    const filter =
      category && typeof category === 'string' ? { category } : {}
    const products = await Product.find(filter).sort({ name: 1 }).lean()
    res.json(products)
  } catch {
    res.status(500).json({ error: 'Failed to load products' })
  }
})

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id }).lean()
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.json(product)
  } catch {
    res.status(500).json({ error: 'Failed to load product' })
  }
})

app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, email, address, items } = req.body
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Valid email is required' })
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must include at least one item' })
    }

    const lines = []
    for (const line of items) {
      const { productId, quantity } = line
      const q = Number(quantity)
      if (!productId || !Number.isFinite(q) || q < 1) {
        return res.status(400).json({ error: 'Each item needs productId and quantity >= 1' })
      }
      const p = await Product.findOne({ id: productId }).lean()
      if (!p) {
        return res.status(400).json({ error: `Unknown product: ${productId}` })
      }
      if (p.stock < q) {
        return res.status(400).json({ error: `Insufficient stock for ${p.name}` })
      }
      lines.push({ productId, q, p })
    }

    const decremented = []
    try {
      for (const { productId, q } of lines) {
        const updated = await Product.findOneAndUpdate(
          { id: productId, stock: { $gte: q } },
          { $inc: { stock: -q } },
          { new: true },
        )
        if (!updated) {
          throw new Error('STOCK_CHANGED')
        }
        decremented.push({ productId, q })
      }

      let total = 0
      const orderItems = lines.map(({ q, p }) => {
        const lineTotal = p.price * q
        total += lineTotal
        return {
          productId: p.id,
          name: p.name,
          quantity: q,
          unitPrice: p.price,
          lineTotal,
        }
      })

      const orderId = randomUUID()
      const order = await Order.create({
        id: orderId,
        customerName: customerName || '',
        email: email.trim(),
        address: address || '',
        items: orderItems,
        total: Math.round(total * 100) / 100,
      })

      res.status(201).json({
        id: order.id,
        total: order.total,
        message: 'Order placed successfully',
      })
    } catch (err) {
      for (const d of decremented) {
        await Product.updateOne({ id: d.productId }, { $inc: { stock: d.qty } })
      }
      if (err?.message === 'STOCK_CHANGED') {
        return res.status(400).json({ error: 'Stock changed; refresh and try again' })
      }
      throw err
    }
  } catch {
    res.status(500).json({ error: 'Failed to place order' })
  }
})

const clientDist = join(__dirname, '..', '..', 'client', 'dist')
if (existsSync(clientDist)) {
  app.use(express.static(clientDist))
  app.get('*', (_req, res, next) => {
    if (_req.path.startsWith('/api')) return next()
    res.sendFile(join(clientDist, 'index.html'))
  })
}

async function main() {
  await connectDb()
  const dbName = mongoose.connection.name
  console.log(`MongoDB database name: "${dbName}" (check this DB in Compass / Atlas)`)

  const seed = await seedProductsIfEmpty()
  if (seed.seeded) {
    console.log(`Seeded ${seed.count} products into collection "products"`)
  } else {
    console.log(`Products collection already has ${seed.count} document(s) — skipped seed`)
  }

  const orderCount = await Order.countDocuments()
  console.log(
    `Orders collection has ${orderCount} document(s) — it stays empty until someone checks out in the app`,
  )

  app.listen(PORT, () => {
    console.log(`E-commerce API listening at http://localhost:${PORT}`)
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
