import { useState } from 'react'; import { Link } from 'react-router-dom'; import { Trash2, ShoppingBag } from 'lucide-react'; import { useCart } from '../context/CartContext'; import { useAuth } from '../context/AuthContext'; import { orders } from '../lib/api';

export default function Cart() {
  const cart = useCart();
  const { user } = useAuth();
  const [form, setForm] = useState({ deliveryMethod: 'Home delivery', deliveryAddress: '', contactPhone: '', notes: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [placed, setPlaced] = useState(null);

  async function checkout(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const items = cart.items.map(i => ({ book: i.id, quantity: i.qty }));
      const r = await orders.create({ items, ...form });
      setPlaced(r.data?.order || r.data);
      cart.clear();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place your order.');
    } finally { setBusy(false); }
  }

  if (placed) return <div className="page"><section className="section"><h1>Order placed ✦</h1><p>Thanks — your order total was ৳{placed.total}. You can track its status any time from My Orders.</p><div style={{ display: 'flex', gap: 14, marginTop: 10 }}><Link className="btn primary" to="/orders">View my orders</Link><Link className="text-link" to="/store">Continue shopping</Link></div></section></div>;

  if (!cart.items.length) return <div className="page"><section className="section"><h1>Your cart is empty</h1><p>Add a few books from the store to get started.</p><Link className="btn primary" to="/store">Browse the store</Link></section></div>;

  return <div className="page">
    <section className="section">
      <h1>Your cart</h1>
      <div className="cart-list">
        {cart.items.map(i => <div className="cart-row" key={i.id}>
          <img src={i.coverUrl || 'https://covers.openlibrary.org/b/id/8231856-L.jpg'} alt={i.title} />
          <div className="cart-row-info">
            <h3>{i.title}</h3>
            <p>{i.author}</p>
          </div>
          <input type="number" min="1" value={i.qty} onChange={e => cart.updateQty(i.id, Number(e.target.value) || 1)} className="cart-qty" />
          <strong>৳{i.price * i.qty}</strong>
          <button className="icon-btn" onClick={() => cart.removeItem(i.id)}><Trash2 size={16} /></button>
        </div>)}
      </div>

      <div className="cart-summary">
        <span>Total</span><strong>৳{cart.total}</strong>
      </div>

      {!user
        ? <div className="quiet-callout"><ShoppingBag /><div><h3>Sign in to check out</h3><p>Your cart is saved — sign in to place the order.</p></div><Link className="text-link" to="/signin">Sign in →</Link></div>
        : <form className="form-card" onSubmit={checkout} style={{ marginTop: 20 }}>
          <div className="form-grid">
            <label>Contact phone<input required type="tel" value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })} placeholder="e.g. 01XXXXXXXXX" /></label>
            <label>Delivery method
              <select value={form.deliveryMethod} onChange={e => setForm({ ...form, deliveryMethod: e.target.value })}>
                <option>Home delivery</option><option>Store pickup</option>
              </select>
            </label>
            <label style={{ gridColumn: '1/-1' }}>Delivery address<textarea required={form.deliveryMethod === 'Home delivery'} value={form.deliveryAddress} onChange={e => setForm({ ...form, deliveryAddress: e.target.value })} placeholder="Where should we deliver this?" /></label>
            <label style={{ gridColumn: '1/-1' }}>Notes (optional)<textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></label>
          </div>
          <button className="btn primary" disabled={busy}>{busy ? 'Placing order…' : `Place order · ৳${cart.total}`}</button>
          {error && <p className="error">{error}</p>}
        </form>}
    </section>
  </div>;
}