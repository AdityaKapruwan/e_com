import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchProduct } from '../api'
import { useCart } from '../context/CartContext'
import type { Product } from '../types'

export function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addItem } = useCart()

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchProduct(id)
      .then((p) => {
        if (!cancelled) {
          setProduct(p)
          setQty(1)
        }
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="page">
        <p className="muted">Loading…</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="page">
        <p className="error-banner">{error ?? 'Product not found.'}</p>
        <Link to="/shop" className="btn btn-primary">
          Back to shop
        </Link>
      </div>
    )
  }

  const maxQty = Math.max(1, product.stock)

  return (
    <div className="page product-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/shop">Shop</Link>
        <span aria-hidden="true">/</span>
        <span>{product.name}</span>
      </nav>
      <div className="product-detail">
        <div className="product-detail-media">
          <img src={product.image} alt="" width={640} height={640} />
        </div>
        <div className="product-detail-info">
          <span className="product-category">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="product-price large">${product.price.toFixed(2)}</p>
          <p className="product-description">{product.description}</p>
          <p className="muted">
            {product.stock > 0 ? `${product.stock} in stock` : 'Currently unavailable'}
          </p>
          <div className="product-buy-row">
            <label className="qty-label">
              <span className="sr-only">Quantity</span>
              <input
                type="number"
                min={1}
                max={maxQty}
                value={qty}
                onChange={(e) => {
                  const n = Number(e.target.value)
                  if (!Number.isFinite(n)) return
                  setQty(Math.max(1, Math.min(Math.floor(n), maxQty)))
                }}
                disabled={product.stock < 1}
              />
            </label>
            <button
              type="button"
              className="btn btn-primary"
              disabled={product.stock < 1}
              onClick={() => addItem(product, qty)}
            >
              Add to cart
            </button>
          </div>
          <Link to="/cart" className="inline-link">
            View cart →
          </Link>
        </div>
      </div>
    </div>
  )
}
