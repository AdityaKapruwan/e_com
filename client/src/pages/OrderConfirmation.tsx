import { Link, useLocation, useParams } from 'react-router-dom'

export function OrderConfirmation() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const total = (location.state as { total?: number } | null)?.total

  return (
    <div className="page confirmation-page">
      <div className="card confirmation-card">
        <p className="eyebrow">Thank you</p>
        <h1>Order confirmed</h1>
        <p className="muted">
          Your order reference is <code className="order-id">{id}</code>
          {total != null && (
            <>
              {' '}
              for <strong>${total.toFixed(2)}</strong>
            </>
          )}
          .
        </p>
        <p className="muted">
          Orders are stored in your <strong>MongoDB</strong> database (see <code>MONGODB_URI</code>{' '}
          on the server).
        </p>
        <div className="hero-actions">
          <Link to="/shop" className="btn btn-primary">
            Continue shopping
          </Link>
          <Link to="/" className="btn btn-ghost">
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
