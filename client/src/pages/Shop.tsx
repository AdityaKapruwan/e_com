import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchProducts } from '../api'
import { useCart } from '../context/CartContext'
import type { Product } from '../types'

const CATEGORIES = ['All', 'Electronics', 'Apparel', 'Home'] as const

export function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam = searchParams.get('category') ?? 'All'
  const activeCategory = CATEGORIES.includes(categoryParam as (typeof CATEGORIES)[number])
    ? categoryParam
    : 'All'

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addItem } = useCart()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const cat = activeCategory === 'All' ? undefined : activeCategory
    fetchProducts(cat)
      .then((data) => {
        if (!cancelled) setProducts(data)
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
  }, [activeCategory])

  const setCategory = (cat: string) => {
    if (cat === 'All') {
      searchParams.delete('category')
      setSearchParams(searchParams, { replace: true })
    } else {
      setSearchParams({ category: cat }, { replace: true })
    }
  }

  const sorted = useMemo(
    () => [...products].sort((a, b) => a.name.localeCompare(b.name)),
    [products],
  )

  return (
    <div className="page shop-page">
      <header className="page-header">
        <h1>Shop</h1>
        <p className="muted">Filter by category or open a product for details.</p>
      </header>

      <div className="filter-bar" role="tablist" aria-label="Categories">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={activeCategory === c}
            className={activeCategory === c ? 'chip chip-active' : 'chip'}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {loading && <p className="muted">Loading products…</p>}
      {error && <p className="error-banner">{error}</p>}

      {!loading && !error && (
        <ul className="product-grid">
          {sorted.map((p) => (
            <li key={p.id} className="product-card">
              <Link to={`/product/${p.id}`} className="product-card-link">
                <div className="product-image-wrap">
                  <img src={p.image} alt="" loading="lazy" width={600} height={600} />
                </div>
                <div className="product-card-body">
                  <span className="product-category">{p.category}</span>
                  <h2>{p.name}</h2>
                  <p className="product-price">${p.price.toFixed(2)}</p>
                </div>
              </Link>
              <div className="product-card-actions">
                <button
                  type="button"
                  className="btn btn-small btn-primary"
                  disabled={p.stock < 1}
                  onClick={() => addItem(p, 1)}
                >
                  {p.stock < 1 ? 'Out of stock' : 'Add to cart'}
                </button>
                <Link to={`/product/${p.id}`} className="btn btn-small btn-ghost">
                  Details
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
