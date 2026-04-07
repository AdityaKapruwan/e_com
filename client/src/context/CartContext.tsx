import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Product } from '../types'

export type CartLine = { product: Product; quantity: number }

type CartContextValue = {
  items: CartLine[]
  addItem: (product: Product, qty?: number) => void
  removeItem: (productId: string) => void
  setQuantity: (productId: string, quantity: number) => void
  clear: () => void
  itemCount: number
  subtotal: number
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'northline-cart-v1'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      return JSON.parse(raw) as CartLine[]
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((product: Product, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((l) => l.product.id === product.id)
      const cap = (n: number) => Math.max(0, Math.min(n, product.stock))
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = {
          ...next[idx],
          product,
          quantity: cap(next[idx].quantity + qty),
        }
        return next
      }
      return [...prev, { product, quantity: cap(qty) }]
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((l) => l.product.id !== productId))
  }, [])

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((l) => {
          if (l.product.id !== productId) return l
          const q = Math.max(0, Math.min(Math.floor(quantity), l.product.stock))
          return { ...l, quantity: q }
        })
        .filter((l) => l.quantity > 0),
    )
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const { itemCount, subtotal } = useMemo(() => {
    let count = 0
    let sum = 0
    for (const l of items) {
      count += l.quantity
      sum += l.product.price * l.quantity
    }
    return { itemCount: count, subtotal: Math.round(sum * 100) / 100 }
  }, [items])

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      setQuantity,
      clear,
      itemCount,
      subtotal,
    }),
    [items, addItem, removeItem, setQuantity, clear, itemCount, subtotal],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
