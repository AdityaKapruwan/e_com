import type { OrderResponse, Product } from './types'

const base = import.meta.env.VITE_API_URL ?? ''

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const message = typeof err.error === 'string' ? err.error : res.statusText
    throw new Error(message)
  }
  return res.json() as Promise<T>
}

export async function fetchProducts(category?: string): Promise<Product[]> {
  const q = category ? `?category=${encodeURIComponent(category)}` : ''
  const res = await fetch(`${base}/api/products${q}`)
  return handle<Product[]>(res)
}

export async function fetchProduct(id: string): Promise<Product> {
  const res = await fetch(`${base}/api/products/${encodeURIComponent(id)}`)
  return handle<Product>(res)
}

export async function placeOrder(body: {
  customerName: string
  email: string
  address: string
  items: { productId: string; quantity: number }[]
}): Promise<OrderResponse> {
  const res = await fetch(`${base}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return handle<OrderResponse>(res)
}
