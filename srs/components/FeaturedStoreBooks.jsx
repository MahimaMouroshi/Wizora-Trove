import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SectionTitle from './SectionTitle';
import BookCard from './BookCard';
import { library } from '../lib/api';
import { useCart } from '../context/CartContext';

export default function FeaturedStoreBooks({ limit = 8 }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const cart = useCart();

  useEffect(() => {
    library
      .list({ source: 'store,both' })
      .then(r => setBooks(r.data?.books || r.data || []))
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, []);

  const visible = books.filter(b => b.isActive !== false).slice(0, limit);

  function addToCart(book) {
    if (!book.sellingPrice) return;
    cart.addItem({ ...book, cartType: 'buy', unitPrice: book.sellingPrice });
    setNotice(`${book.title} added to cart.`);
    setTimeout(() => setNotice(''), 2500);
  }

  return (
    <section className="section">
      <SectionTitle eyebrow="FRESH ON THE SHELF" title="New in the store" />
      {notice && <p className="success">{notice}</p>}
      {loading && <p style={{ fontSize: 13 }}>Loading books…</p>}
      <div className="book-grid">
        {visible.map(b => (
          <BookCard
            key={b._id}
            book={b}
            action={b.sellingPrice ? 'Add to cart' : 'Unavailable'}
            actionDisabled={!b.sellingPrice || (b.stock != null && b.stock < 1)}
            onAction={addToCart}
          />
        ))}
      </div>
      {!loading && !visible.length && <p style={{ fontSize: 13 }}>No books in the store yet.</p>}
      <p style={{ marginTop: 24 }}><Link className="text-link" to="/store">See all store books →</Link></p>
    </section>
  );
}