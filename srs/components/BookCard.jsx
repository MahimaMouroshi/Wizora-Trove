import { Star, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
export default function BookCard({ book, action = 'View book', onAction, actionDisabled }) {
  return <article className="book-card">
    <Link to={`/book/${book._id || book.id || ''}`} className="cover-wrap">
      <img src={book.coverUrl || book.cover || `https://covers.openlibrary.org/b/isbn/${book.isbn || '9780141182803'}-L.jpg`} onError={e => e.currentTarget.src = 'https://covers.openlibrary.org/b/id/8231856-L.jpg'} alt={book.title} />
      <span className="cover-hover"><ArrowUpRight size={18} /></span>
    </Link>
    <div className="book-meta">
      <div><h3>{book.title}</h3><p>{book.author || 'Unknown author'}</p></div>
      <strong>৳{book.sellingPrice ?? book.price ?? book.storePrice ?? ''}</strong>
    </div>
    <div className="book-rating">
      <span><Star size={13} fill="currentColor" /> {Number(book.averageRating || book.rating || 4.6).toFixed(1)}</span>
      <button onClick={() => onAction?.(book)} disabled={actionDisabled}>{action}</button>
    </div>
  </article>;
}