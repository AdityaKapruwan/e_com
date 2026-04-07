import { Link } from 'react-router-dom'

export function Home() {
  return (
    <div className="page home-page">
      <section className="hero">
        <p className="eyebrow">Curated goods for everyday life</p>
        <h1>Thoughtful products, shipped with care.</h1>
        <p className="lede">
          Browse electronics, apparel, and home pieces chosen for quality and longevity.
          Built as a full-stack demo with a real Express catalog and checkout API.
        </p>
        <div className="hero-actions">
          <Link to="/shop" className="btn btn-primary">
            Shop the collection
          </Link>
          <Link to="/shop?category=Electronics" className="btn btn-ghost">
            View electronics
          </Link>
        </div>
      </section>
      <section className="feature-grid" aria-label="Highlights">
        <article>
          <h2>Server-backed catalog</h2>
          <p>Product data is served from Node.js and Express so the UI always reflects the API.</p>
        </article>
        <article>
          <h2>Cart &amp; checkout</h2>
          <p>Your basket persists in the browser; orders post to the API with server-side totals.</p>
        </article>
        <article>
          <h2>Fast React UI</h2>
          <p>Vite-powered React with routing, responsive layout, and accessible patterns.</p>
        </article>
      </section>
    </div>
  )
}
