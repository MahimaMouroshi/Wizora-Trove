import { useEffect, useState } from 'react'; import { useParams, Link, useNavigate } from 'react-router-dom'; import { Star, ArrowLeft, ShoppingBag, BookOpen } from 'lucide-react'; import { library } from '../lib/api'; import { useAuth } from '../context/AuthContext'; import { useCart } from '../context/CartContext';

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const cart = useCart();
  const [book, setBook] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    library.get(id).then(r => setBook(r.data?.book || r.data)).catch(() => setError('Could not find that book.'));
    if (user) library.status().then(r => setStatus(r.data?.membership || r.data)).catch(() => {});
  }, [id, user]);

  const isMember = status?.expiresAt && new Date(status.expiresAt) > new Date() && status?.paymentStatus === 'paid';

  async function rent() {
    setBusy(true); setNotice(''); setError('');
    try {
      await library.rent(book._id);
      setNotice('Rented! Check My Rentals on your profile.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not rent this book.');
    } finally { setBusy(false); }
  }

  function addToCart() {
    cart.addItem(book);
    setNotice('Added to cart.');
  }

  if (error) return <div className="page"><section className="section"><p className="error">{error}</p><Link className="text-link" to="/store">← Back to store</Link></section></div>;
  if (!book) return <div className="page"><section className="section"><p>Loading…</p></section></div>;

  const canBuy = ['store', 'both'].includes(book.source);
  const canRent = ['library', 'both'].includes(book.source);

  return <div className="page">
    <section className="section book-detail">
      <button className="text-link" onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ArrowLeft size={14} /> Back</button>
      <div className="book-detail-grid">
        <img className="book-detail-cover" src={book.coverUrl || `https://covers.openlibrary.org/b/isbn/${book.isbn || '9780141182803'}-L.jpg`} onError={e => e.currentTarget.src = 'https://covers.openlibrary.org/b/id/8231856-L.jpg'} alt={book.title} />
        <div>
          <span className="eyebrow">{book.genre}{book.language ? ` · ${book.language}` : ''}</span>
          <h1>{book.title}</h1>
          <p className="book-detail-author">{book.author}</p>
          <div className="book-rating"><span><Star size={14} fill="currentColor" /> {Number(book.averageRating || 4.6).toFixed(1)}</span></div>
          <p className="book-detail-desc">{book.description || 'No description added yet for this book.'}</p>

          <div className="book-detail-actions">
            {canBuy && <>
              <strong className="book-detail-price">৳{book.sellingPrice ?? '—'}</strong>
              <button className="btn primary" onClick={addToCart} disabled={!book.sellingPrice}><ShoppingBag size={16} /> Add to cart</button>
            </>}
            {canRent && (
              user
                ? isMember
                  ? <button className="btn primary" onClick={rent} disabled={busy || book.availableCopies < 1}><BookOpen size={16} /> {busy ? 'Renting…' : book.availableCopies < 1 ? 'Currently unavailable' : `Rent for ৳${book.rentalFee}`}</button>
                  : <Link className="btn primary" to="/membership"><BookOpen size={16} /> Join library to rent</Link>
                : <Link className="btn primary" to="/signin"><BookOpen size={16} /> Sign in to rent</Link>
            )}
          </div>
          {notice && <p className="success">{notice}</p>}
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    </section>
  </div>;
}