import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import SectionTitle from '../components/SectionTitle';
import BookCard from '../components/BookCard';
import { library } from '../lib/api';
import { useCart } from '../context/CartContext';

const GENRES = ['Thriller', 'Romance', 'Fantasy', 'Supernatural', 'Classic', 'Fiction', 'Non-fiction', 'Mystery'];

export default function Store() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [genre, setGenre] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const cart = useCart();

  useEffect(() => {
    setLoading(true);
    library
      .list({ source: 'store,both', search: q || undefined })
      .then(r => setBooks(r.data?.books || r.data || []))
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, [q]);

  // Hide archived books and apply the genre filter (case-insensitive)
  const visibleBooks = books.filter(b =>
    b.isActive !== false &&
    (!genre || (b.genre || '').toLowerCase() === genre.toLowerCase())
  );

  function submitSearch(e) {
    e.preventDefault();
    setParams(q ? { q } : {});
  }

  function addToCart(book) {
    setError('');
    if (!book.sellingPrice) {
      setError('This book has no selling price yet.');
      return;
    }
    try {
      // Store purchase: always the SELLING price (never the rental fee)
      cart.addItem({ ...book, cartType: 'buy', unitPrice: book.sellingPrice });
      setNotice(`${book.title} added to cart.`);
      setTimeout(() => setNotice(''), 2500);
    } catch {
      setError('Could not add that book to the cart. Please try again.');
    }
  }

  function actionLabel(b) {
    if (!b.sellingPrice) return 'Unavailable';
    if (b.stock !== undefined && b.stock !== null && b.stock < 1) return 'Out of stock';
    return 'Add to cart';
  }

  const isUnavailable = b =>
    !b.sellingPrice || (b.stock !== undefined && b.stock !== null && b.stock < 1);

  return (
    <div className="page">
      <section className="page-hero store-hero">
        <span className="eyebrow">WIZORA STORE</span>
        <h1>New books.<br /><i>Fresh stories.</i></h1>
        <p>Books worth slowing down for, carefully selected for curious readers.</p>
      </section>

      <section className="section">
        <SectionTitle eyebrow="THE BOOKSHELF" title="Shop new books" />
        {notice && <p className="success">{notice}</p>}
        {error && <p className="error" style={{ color: '#b4534b', fontSize: 13 }}>{error}</p>}

        <form className="toolbar" onSubmit={submitSearch}>
          <div className="search">
            <Search size={17} />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search books or authors..."
            />
          </div>
          <select value={genre} onChange={e => setGenre(e.target.value)}>
            <option value="">All categories</option>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </form>

        {loading && <p style={{ fontSize: 13 }}>Loading books…</p>}

        <div className="book-grid">
          {visibleBooks.map(b => (
            <BookCard
              key={b._id}
              book={b}
              action={actionLabel(b)}
              actionDisabled={isUnavailable(b)}
              onAction={addToCart}
            />
          ))}
        </div>

        {!loading && !visibleBooks.length && (
          <p style={{ fontSize: 13 }}>No books in the store yet — check back soon.</p>
        )}
      </section>
    </div>
  );
}