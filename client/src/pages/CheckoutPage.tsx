import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { placeOrder } from '../api'
import { useCart } from '../context/CartContext'

export function CheckoutPage() {
  const navigate = useNavigate()
  const { items, subtotal, clear } = useCart()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (items.length === 0) {
    return (
      <div className="page checkout-page">
        <h1>Checkout</h1>
        <p className="muted">Your cart is empty.</p>
        <Link to="/shop" className="btn btn-primary">
          Shop now
        </Link>
      </div>
    )
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await placeOrder({
        customerName: name.trim(),
        email: email.trim(),
        address: address.trim(),
        items: items.map((l) => ({
          productId: l.product.id,
          quantity: l.quantity,
        })),
      })
      clear()
      navigate(`/order-confirmation/${res.id}`, {
        state: { total: res.total },
        replace: true,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page checkout-page">
      <h1>Checkout</h1>
      <div className="checkout-layout">
        <form className="checkout-form card" onSubmit={onSubmit}>
          <h2>Shipping details</h2>
          {error && <p className="error-banner">{error}</p>}
          <label className="field">
            <span>Full name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="Alex Rivera"
            />
          </label>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
            />
          </label>
          <label className="field">
            <span>Address</span>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              placeholder="Street, city, postal code"
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Placing order…' : `Pay $${subtotal.toFixed(2)}`}
          </button>
        </form>
        <aside className="checkout-aside card">
          <h2>Order summary</h2>
          <ul className="checkout-lines">
            {items.map((l) => (
              <li key={l.product.id}>
                <span>
                  {l.product.name} × {l.quantity}
                </span>
                <span>${(l.product.price * l.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <p className="checkout-total">
            Total <strong>${subtotal.toFixed(2)}</strong>
          </p>
          <p className="muted small">
            Totals are verified on the server when you place the order.
          </p>
        </aside>
      </div>
    </div>
  )
}
