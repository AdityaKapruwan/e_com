import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export function CartPage() {
  const { items, setQuantity, removeItem, subtotal } = useCart()

  if (items.length === 0) {
    return (
      <div className="page cart-page">
        <h1>Your cart</h1>
        <p className="muted">Nothing here yet.</p>
        <Link to="/shop" className="btn btn-primary">
          Continue shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="page cart-page">
      <h1>Your cart</h1>
      <ul className="cart-list">
        {items.map((line) => (
          <li key={line.product.id} className="cart-line">
            <Link to={`/product/${line.product.id}`} className="cart-thumb">
              <img src={line.product.image} alt="" width={96} height={96} />
            </Link>
            <div className="cart-line-info">
              <Link to={`/product/${line.product.id}`}>{line.product.name}</Link>
              <p className="muted">${line.product.price.toFixed(2)} each</p>
            </div>
            <div className="cart-line-qty">
              <label>
                <span className="sr-only">Quantity for {line.product.name}</span>
                <input
                  type="number"
                  min={1}
                  max={line.product.stock}
                  value={line.quantity}
                  onChange={(e) => {
                    const n = Number(e.target.value)
                    if (!Number.isFinite(n)) return
                    setQuantity(line.product.id, n)
                  }}
                />
              </label>
            </div>
            <div className="cart-line-total">
              ${(line.product.price * line.quantity).toFixed(2)}
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              aria-label={`Remove ${line.product.name}`}
              onClick={() => removeItem(line.product.id)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <div className="cart-summary">
        <p className="cart-subtotal">
          Subtotal <strong>${subtotal.toFixed(2)}</strong>
        </p>
        <Link to="/checkout" className="btn btn-primary">
          Checkout
        </Link>
        <Link to="/shop" className="btn btn-ghost">
          Keep shopping
        </Link>
      </div>
    </div>
  )
}
