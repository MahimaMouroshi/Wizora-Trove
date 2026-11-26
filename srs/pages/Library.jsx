import { useEffect, useState } from 'react'; import { Link } from 'react-router-dom'; import { Search, Star, Clock, ArrowRight, LockKeyhole } from 'lucide-react'; import SectionTitle from '../components/SectionTitle'; import BookCard from '../components/BookCard'; import { library } from '../lib/api'; import { useAuth } from '../context/AuthContext';

export default function Library() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    library.list().then(r => setBooks(r.data?.books || r.data || [])).catch(() => {});
    if (user) library.status().then(r => setStatus(r.data?.membership || r.data)).catch(() => setStatus(null));
  }, [user]);

  // A member is active only if membership has a future expiry AND payment is marked paid —
  // matches exactly what the backend checks before allowing a rental.
  const isMember = !!(status?.expiresAt && new Date(status.expiresAt) > new Date() && status?.paymentStatus === 'paid');

  const filtered = books.filter(b => (b.title || '').toLowerCase().includes(q.toLowerCase()));

  async function rent(book) {
    setNotice('');
    try {
      await library.rent(book._id);
      setNotice(`"${book.title}" rented — check My Rentals on your profile.`);
      setBooks(bs => bs.map(b => b._id === book._id ? { ...b, availableCopies: Math.max(0, (b.availableCopies || 1) - 1) } : b));
    } catch (err) {
      setNotice(err.response?.data?.message || 'Could not rent this book.');
    }
  }

  function actionFor(book) {
    if (!user) return 'Sign in to rent';
    if (!isMember) return 'Join to rent';
    if ((book.availableCopies ?? 1) < 1) return 'Unavailable';
    return `Rent for ৳${book.rentalFee ?? 20}`;
  }

  function handleAction(book) {
    if (!user) { window.location.href = '/signin'; return; }
    if (!isMember) { window.location.href = '/membership'; return; }
    if ((book.availableCopies ?? 1) < 1) return;
    rent(book);
  }

  return <div className="page">
    <section className="page-hero library-hero">
      <span className="eyebrow">READ MORE. BUY LESS.</span>
      <h1>Trove Library</h1>
      <p>A growing shelf of books that gets passed from one reader to the next.</p>
      <div className="member-pill">{isMember ? 'Active member' : 'Membership required'} <span>•</span> up to 3 books</div>
    </section>

    {!isMember && <section className="membership-grid">
      <div className="membership-card"><span>03 MONTHS</span><h2>500৳</h2><p>For readers who want to start small.</p><ul><li>Library access</li><li>Membership ID</li><li>Annotation kit</li><li>20৳ per book</li></ul><Link className="btn primary" to="/membership">Choose plan</Link></div>
      <div className="membership-card featured"><span>06 MONTHS</span><h2>800৳</h2><p>A longer reading journey with Trove.</p><ul><li>Library access</li><li>Membership ID</li><li>Annotation kit</li><li>20৳ per book</li></ul><Link className="btn primary" to="/membership">Choose plan</Link></div>
      <div className="membership-card"><span>12 MONTHS</span><h2>1,500৳</h2><p>For readers making Trove part of their routine.</p><ul><li>Library access</li><li>Membership ID</li><li>Annotation kit</li><li>Birthday surprise after 12 months</li></ul><Link className="btn primary" to="/membership">Choose plan</Link></div>
    </section>}

    <section className="section">
      <SectionTitle eyebrow="THE SHELF" title="Available books"><Link className="text-link" to="/request">Request a book →</Link></SectionTitle>
      {notice && <p className="success">{notice}</p>}
      <div className="toolbar">
        <div className="search"><Search size={17} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search the library..." /></div>
      </div>
      <div className="book-grid">
        {filtered.map(b => <BookCard key={b._id || b.id} book={b} action={actionFor(b)} actionDisabled={isMember && (b.availableCopies ?? 1) < 1} onAction={handleAction} />)}
      </div>
      {!filtered.length && <p style={{ fontSize: 13 }}>No books in the library yet.</p>}
    </section>

    <section className="how">
      <SectionTitle eyebrow="HOW IT WORKS" title="Four small steps." />
      <div className="steps">
        <div><b>01</b><Clock /><h3>Choose</h3><p>Pick an available title.</p></div>
        <div><b>02</b><Search /><h3>Read</h3><p>Keep it for one month.</p></div>
        <div><b>03</b><ArrowRight /><h3>Return</h3><p>Pass it to the next reader.</p></div>
        <div><b>04</b><Star /><h3>Rate</h3><p>Leave your honest rating.</p></div>
      </div>
    </section>

    {!isMember && <section className="quiet-callout"><LockKeyhole /><div><h3>Not a member yet?</h3><p>Everyone can browse the shelf. Membership unlocks rentals.</p></div><Link className="text-link" to="/membership">See membership →</Link></section>}
  </div>;
}