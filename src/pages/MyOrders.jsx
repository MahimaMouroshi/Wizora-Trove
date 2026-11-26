import { useEffect, useState } from 'react'; import { Link } from 'react-router-dom'; import { Package } from 'lucide-react'; import { orders } from '../lib/api';

const statusColors = { pending: '#94704d', processing: '#94704d', ready: '#5a7a9c', shipped: '#5a7a9c', completed: '#60765a', cancelled: '#a35b4f' };

function Badge({ label }) {
  const color = statusColors[label] || '#80766d';
  return <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: color + '22', color, textTransform: 'capitalize' }}>{label}</span>;
}

export default function MyOrders() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orders.mine().then(r => setList(r.data?.orders || r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return <div className="page">
    <section className="section">
      <h1>My orders</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 20 }}>Track every store order you've placed and its current status.</p>

      {loading && <p style={{ fontSize: 13 }}>Loading your orders…</p>}
      {!loading && !list.length && <div className="quiet-callout"><Package /><div><h3>No orders yet</h3><p>Once you check out from the store, your orders will show up here.</p></div><Link className="text-link" to="/store">Browse the store →</Link></div>}

      <div className="order-list">
        {list.map(o => <div className="order-card" key={o._id}>
          <div className="order-card-head">
            <div>
              <strong>Order #{o._id.slice(-6).toUpperCase()}</strong>
              <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 10 }}>{new Date(o.createdAt).toLocaleDateString()}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Badge label={o.orderStatus} />
              <Badge label={o.paymentStatus} />
            </div>
          </div>
          <div className="order-card-items">
            {o.items.map((it, idx) => <div key={idx} className="order-item-row">
              <span>{it.title || it.book?.title}</span>
              <span>x{it.quantity}</span>
              <span>৳{it.unitPrice * it.quantity}</span>
            </div>)}
          </div>
          <div className="order-card-foot">
            <span>{o.deliveryMethod}{o.deliveryAddress ? ` · ${o.deliveryAddress}` : ''}</span>
            <strong>Total ৳{o.total}</strong>
          </div>
        </div>)}
      </div>
    </section>
  </div>;
}