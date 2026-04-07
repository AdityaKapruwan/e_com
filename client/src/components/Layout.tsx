import { Link, NavLink, Outlet } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export function Layout() {
  const { itemCount } = useCart()

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link to="/" className="logo">
          Northline<span>Market</span>
        </Link>
        <nav className="nav-main" aria-label="Primary">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/shop">Shop</NavLink>
          <NavLink to="/cart" className="nav-cart">
            Cart
            {itemCount > 0 && <span className="badge">{itemCount}</span>}
          </NavLink>
        </nav>
      </header>
      <main className="site-main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>Demo store — React · Vite · Express API</p>
      </footer>
    </div>
  )
}
