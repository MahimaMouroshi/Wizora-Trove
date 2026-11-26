import { useEffect, useState } from 'react';
import { Users, BookOpen, ClipboardList, ShoppingBag, RefreshCw, Plus, ArrowUpRight, X, Pencil, Archive } from 'lucide-react';
import { admin } from '../lib/api';
import { Link } from 'react-router-dom';
<Link className="btn primary" to="/admin/books">Manage store &amp; library books</Link>
const TABS = ['Dashboard', 'Users', 'Library', 'Requests', 'Decutler', 'Orders', 'Restoration', 'Blind Date'];
const BD_PACKS = ['Basic', 'Moderate', 'Premium', 'Luxury'];
const BD_GENRES = ['Romance', 'Thriller', 'Mystery', 'Classic', 'Supernatural', 'Sci-fi', 'Religious', 'Mythology'];
const emptyBdOption = { packageCategory: 'Basic', genre: 'Thriller', language: 'Bangla', title: '' };

const emptyBook = { title: '', author: '', genre: '', language: 'English', description: '', coverUrl: '', purchasePrice: '', sellingPrice: '', condition: 'good', source: 'library', libraryCopies: 1, rentalFee: 20 };

const row = { display: 'flex', gap: 14, alignItems: 'center', padding: '12px 4px', borderBottom: '1px solid var(--line)', fontSize: 12 };
const cell = { flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const btn = { border: '1px solid var(--line)', background: '#fffdf9', padding: '6px 10px', borderRadius: 5, fontSize: 11, cursor: 'pointer' };

function Select({ value, onChange, options }) {
  return <select value={value} onChange={e => onChange(e.target.value)} style={{ border: '1px solid var(--line)', background: '#fffdf9', padding: '6px 8px', borderRadius: 5, fontSize: 11 }}>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>;
}

export default function Admin() {
  const [tab, setTab] = useState('Dashboard');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [requests, setRequests] = useState([]);
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [restorations, setRestorations] = useState([]);
  const [blindDates, setBlindDates] = useState([]);
  const [bdOptions, setBdOptions] = useState([]);
  const [bdOptionForm, setBdOptionForm] = useState(emptyBdOption);
  const [bdOptionBusy, setBdOptionBusy] = useState(false);
  const [rentals, setRentals] = useState([]);
  const [loaded, setLoaded] = useState({});
  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBookId, setEditingBookId] = useState(null);
  const [bookForm, setBookForm] = useState(emptyBook);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [planChoice, setPlanChoice] = useState({});

  useEffect(() => {
    admin.stats().then(r => setStats(r.data?.stats || r.data)).catch(() => {});
    admin.requests().then(r => setRequests(r.data?.requests || r.data || [])).catch(() => {});
    admin.users().then(r => setUsers(r.data?.users || r.data || [])).catch(() => {});
  }, []);

  function openTab(t) {
    setTab(t);
    setNotice('');
    if (loaded[t]) return;
    if (t === 'Library') admin.books().then(r => setBooks(r.data?.books || r.data || [])).catch(() => {});
    if (t === 'Decutler') admin.listings().then(r => setListings(r.data?.listings || r.data || [])).catch(() => {});
    if (t === 'Orders') admin.orders().then(r => setOrders(r.data?.orders || r.data || [])).catch(() => {});
    if (t === 'Restoration') admin.restorations().then(r => setRestorations(r.data?.restorations || r.data || [])).catch(() => {});
    if (t === 'Blind Date') { admin.blindDates().then(r => setBlindDates(r.data?.orders || r.data || [])).catch(() => {}); admin.blindDateOptions().then(r => setBdOptions(r.data?.options || r.data || [])).catch(() => {}); }
    if (t === 'Requests') admin.rentals().then(r => setRentals(r.data?.rentals || r.data || [])).catch(() => {});
    setLoaded(l => ({ ...l, [t]: true }));
  }

  function startAddBook() {
    setEditingBookId(null);
    setBookForm(emptyBook);
    setShowBookForm(true);
    openTab('Library');
  }

  function startEditBook(b) {
    setEditingBookId(b._id);
    setBookForm({ title: b.title || '', author: b.author || '', genre: b.genre || '', language: b.language || 'English', description: b.description || '', coverUrl: b.coverUrl || '', purchasePrice: b.purchasePrice ?? '', sellingPrice: b.sellingPrice ?? '', condition: b.condition || 'good', source: b.source || 'library', libraryCopies: b.libraryCopies ?? 1, rentalFee: b.rentalFee ?? 20 });
    setShowBookForm(true);
  }

  async function submitBook(e) {
    e.preventDefault();
    setBusy(true); setNotice('');
    const payload = { ...bookForm, purchasePrice: bookForm.purchasePrice === '' ? undefined : Number(bookForm.purchasePrice), sellingPrice: bookForm.sellingPrice === '' ? undefined : Number(bookForm.sellingPrice), libraryCopies: Number(bookForm.libraryCopies) || 1, rentalFee: Number(bookForm.rentalFee) || 0 };
    try {
      if (editingBookId) {
        const r = await admin.updateBook(editingBookId, payload);
        setBooks(bs => bs.map(b => b._id === editingBookId ? (r.data?.book || r.data) : b));
        setNotice('Book updated.');
      } else {
        const r = await admin.createBook(payload);
        setBooks(bs => [r.data?.book || r.data, ...bs]);
        setNotice('Book added.');
      }
      setShowBookForm(false);
      setBookForm(emptyBook);
      setEditingBookId(null);
    } catch (err) {
      setNotice(err.response?.data?.message || 'Something went wrong saving that book.');
    } finally {
      setBusy(false);
    }
  }

  async function archiveBook(id) {
    if (!confirm('Archive this book? It will no longer show in the store or library.')) return;
    try {
      const r = await admin.deleteBook(id);
      setBooks(bs => bs.map(b => b._id === id ? (r.data?.book || { ...b, isActive: false }) : b));
    } catch { setNotice('Could not archive that book.'); }
  }

  async function changeUser(id, patch) {
    try {
      const r = await admin.updateUser(id, patch);
      setUsers(us => us.map(u => u._id === id ? (r.data?.user || u) : u));
    } catch { setNotice('Could not update that user.'); }
  }

  async function approveMembership(id) {
    try {
      const plan = planChoice[id] || '3_month';
      const r = await admin.activateMembership({ userId: id, plan, paymentStatus: 'paid' });
      setUsers(us => us.map(u => u._id === id ? (r.data?.user || u) : u));
      setNotice('Approved as library member.');
    } catch (err) { setNotice(err.response?.data?.message || 'Could not approve that membership.'); }
  }

  async function changeRequest(id, status) {
    try {
      const r = await admin.updateRequest(id, { status });
      setRequests(rs => rs.map(x => x._id === id ? (r.data?.request || x) : x));
    } catch { setNotice('Could not update that request.'); }
  }

  async function changeOrder(id, patch) {
    try {
      const r = await admin.updateOrder(id, patch);
      setOrders(os => os.map(o => o._id === id ? (r.data?.order || o) : o));
    } catch { setNotice('Could not update that order.'); }
  }

  async function changeRestoration(id, status) {
    try {
      const r = await admin.updateRestoration(id, { status });
      setRestorations(rs => rs.map(x => x._id === id ? (r.data?.request || x) : x));
    } catch { setNotice('Could not update that restoration request.'); }
  }

  async function changeBlindDate(id, status) {
    try {
      const r = await admin.updateBlindDate(id, { status });
      setBlindDates(bs => bs.map(x => x._id === id ? (r.data?.order || x) : x));
    } catch { setNotice('Could not update that blind date order.'); }
  }

  async function addBdOption(e) {
    e.preventDefault();
    if (!bdOptionForm.title.trim()) return;
    setBdOptionBusy(true); setNotice('');
    try {
      const r = await admin.createBlindDateOption(bdOptionForm);
      setBdOptions(os => [...os, r.data?.option || r.data]);
      setBdOptionForm({ ...bdOptionForm, title: '' });
    } catch (err) {
      setNotice(err.response?.data?.message || 'Could not add that title.');
    } finally {
      setBdOptionBusy(false);
    }
  }

  async function removeBdOption(id) {
    try {
      await admin.deleteBlindDateOption(id);
      setBdOptions(os => os.filter(o => o._id !== id));
    } catch { setNotice('Could not remove that title.'); }
  }

  const cards = [['Users', stats.users || 0, Users], ['Library members', stats.members || 0, BookOpen], ['Books rented', stats.activeRentals || 0, RefreshCw], ['Open requests', stats.requests || 0, ClipboardList]];

  return <div className="admin">
    <aside className="admin-side">
      <div className="admin-brand">Wizora <em>Trove</em><small>ADMIN STUDIO</small></div>
      {TABS.map(t => <a key={t} className={t === tab ? 'active' : ''} onClick={() => openTab(t)} style={{ cursor: 'pointer' }}>{t}</a>)}
    </aside>
    <div className="admin-content">
      <header>
        <div><span className="eyebrow">WIZORA TROVE / ADMIN</span><h1>Good morning, curator.</h1></div>
        <button className="btn primary" onClick={startAddBook}><Plus size={16} /> Add book</button>
      </header>

      {notice && <div className="quiet-callout" style={{ marginBottom: 20 }}><div><p style={{ margin: 0 }}>{notice}</p></div><button className="text-link" onClick={() => setNotice('')}>Dismiss</button></div>}

      {tab === 'Dashboard' && <>
        <div className="admin-cards">{cards.map(([l, n, I]) => <div key={l}><I /><span>{l}</span><b>{n}</b></div>)}</div>
        <div className="admin-two">
          <section className="admin-panel">
            <div className="panel-title"><div><span className="eyebrow">REQUEST QUEUE</span><h2>Books readers want</h2></div><ArrowUpRight /></div>
            {(requests.length ? requests : []).slice(0, 5).map(r => <div className="request-admin" key={r._id}><span>{r.bookTitle}</span><b>{r.supporters?.length || 0}/5</b><em className={r.status !== 'collecting' ? 'ready' : ''}>{r.status}</em></div>)}
            {!requests.length && <p style={{ fontSize: 12 }}>No book requests yet.</p>}
          </section>
          <section className="admin-panel">
            <div className="panel-title"><div><span className="eyebrow">MEMBERS</span><h2>Latest readers</h2></div></div>
            <div className="table"><div className="tr head"><span>Name</span><span>Email</span><span>Status</span></div>
              {users.slice(0, 6).map(u => <div className="tr" key={u._id}><span>{u.name}</span><span>{u.email}</span><span><em className={u.membership?.paymentStatus === 'paid' ? 'ready' : ''}>{u.role === 'admin' ? 'Admin' : (u.membership?.paymentStatus === 'paid' ? 'Member' : 'Pending')}</em></span></div>)}
            </div>
          </section>
        </div>
      </>}

      {tab === 'Users' && <section className="admin-panel">
        <div className="panel-title"><div><span className="eyebrow">USERS</span><h2>All accounts</h2></div></div>
        {users.map(u => {
          const isMember = u.membership?.expiresAt && new Date(u.membership.expiresAt) > new Date() && u.membership?.paymentStatus === 'paid';
          return <div key={u._id} style={{ borderBottom: '1px solid var(--line)', padding: '12px 4px' }}>
            <div style={row}>
              <span style={{ ...cell, flex: 1.4 }}>{u.name}</span>
              <span style={{ ...cell, flex: 1.6 }}>{u.email}</span>
              <Select value={u.role} onChange={v => changeUser(u._id, { role: v })} options={['user', 'admin']} />
              <Select value={u.status} onChange={v => changeUser(u._id, { status: v })} options={['active', 'suspended']} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, fontSize: 11 }}>
              <span style={{ color: 'var(--muted)' }}>Library:</span>
              {isMember
                ? <em className="ready" style={{ fontStyle: 'normal', fontSize: 10, padding: '4px 8px', borderRadius: 20, background: '#dfe9da', color: '#60765a' }}>Member until {new Date(u.membership.expiresAt).toLocaleDateString()}</em>
                : <>
                  <em style={{ fontStyle: 'normal', fontSize: 10, padding: '4px 8px', borderRadius: 20, background: '#efe2d2', color: '#94704d' }}>Not a member</em>
                  <Select value={planChoice[u._id] || '3_month'} onChange={v => setPlanChoice(p => ({ ...p, [u._id]: v }))} options={['3_month', '6_month', '12_month']} />
                  <button style={btn} onClick={() => approveMembership(u._id)}>Approve as library member</button>
                </>}
            </div>
          </div>;
        })}
        {!users.length && <p style={{ fontSize: 12 }}>No users yet.</p>}
      </section>}

      {tab === 'Library' && <section className="admin-panel">
        <div className="panel-title"><div><span className="eyebrow">LIBRARY / STORE</span><h2>All books</h2></div></div>

        {showBookForm && <form className="form-card" onSubmit={submitBook} style={{ margin: '20px 0' }}>
          <div className="panel-title"><h2>{editingBookId ? 'Edit book' : 'Add a book'}</h2><button type="button" className="icon-btn" onClick={() => { setShowBookForm(false); setEditingBookId(null); }}><X size={18} /></button></div>
          <div className="form-grid">
            <label>Title<input required value={bookForm.title} onChange={e => setBookForm({ ...bookForm, title: e.target.value })} /></label>
            <label>Author<input required value={bookForm.author} onChange={e => setBookForm({ ...bookForm, author: e.target.value })} /></label>
            <label>Genre<input required value={bookForm.genre} onChange={e => setBookForm({ ...bookForm, genre: e.target.value })} /></label>
            <label>Language
              <select value={bookForm.language} onChange={e => setBookForm({ ...bookForm, language: e.target.value })}>
                <option>English</option><option>Bangla</option><option>Other</option>
              </select>
            </label>
            <label>Cover image URL<input value={bookForm.coverUrl} onChange={e => setBookForm({ ...bookForm, coverUrl: e.target.value })} /></label>
            <label>Condition
              <select value={bookForm.condition} onChange={e => setBookForm({ ...bookForm, condition: e.target.value })}>
                <option value="new">new</option><option value="excellent">excellent</option><option value="good">good</option><option value="fair">fair</option><option value="poor">poor</option>
              </select>
            </label>
            <label>Available as
              <select value={bookForm.source} onChange={e => setBookForm({ ...bookForm, source: e.target.value })}>
                <option value="library">library only</option><option value="store">store only</option><option value="both">library + store</option>
              </select>
            </label>
            <label>Purchase price (৳)<input type="number" min="0" value={bookForm.purchasePrice} onChange={e => setBookForm({ ...bookForm, purchasePrice: e.target.value })} /></label>
            <label>Selling price (৳)<input type="number" min="0" value={bookForm.sellingPrice} onChange={e => setBookForm({ ...bookForm, sellingPrice: e.target.value })} /></label>
            <label>Rental fee (৳)<input type="number" min="0" value={bookForm.rentalFee} onChange={e => setBookForm({ ...bookForm, rentalFee: e.target.value })} /></label>
            <label>Library copies<input type="number" min="0" max="2" value={bookForm.libraryCopies} onChange={e => setBookForm({ ...bookForm, libraryCopies: e.target.value })} /></label>
            <label style={{ gridColumn: '1/-1' }}>Description<textarea value={bookForm.description} onChange={e => setBookForm({ ...bookForm, description: e.target.value })} /></label>
          </div>
          <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : editingBookId ? 'Save changes' : 'Add book'}</button>
        </form>}

        {books.map(b => <div style={row} key={b._id}>
          <span style={{ ...cell, flex: 1.6 }}>{b.title}{!b.isActive && <em style={{ marginLeft: 8 }}> (archived)</em>}</span>
          <span style={cell}>{b.author}</span>
          <span style={{ ...cell, flex: 0.6 }}>{b.source}</span>
          <span style={{ ...cell, flex: 0.6 }}>৳{b.sellingPrice ?? '—'}</span>
          <button style={btn} onClick={() => startEditBook(b)}><Pencil size={12} /> Edit</button>
          {b.isActive && <button style={btn} onClick={() => archiveBook(b._id)}><Archive size={12} /> Archive</button>}
        </div>)}
        {!books.length && <p style={{ fontSize: 12 }}>No books yet — add your first one above.</p>}
      </section>}

      {tab === 'Requests' && <section className="admin-panel">
        <div className="panel-title"><div><span className="eyebrow">BOOK REQUESTS</span><h2>What readers are asking for</h2></div></div>
        {requests.map(r => <div style={row} key={r._id}>
          <span style={{ ...cell, flex: 1.6 }}>{r.bookTitle}</span>
          <span style={{ ...cell, flex: 0.6 }}>{r.supporters?.length || 0} supporters</span>
          <Select value={r.status} onChange={v => changeRequest(r._id, v)} options={['collecting', 'confirmed', 'ordered', 'available', 'completed', 'rejected']} />
        </div>)}
        {!requests.length && <p style={{ fontSize: 12 }}>No open requests.</p>}
        <div className="panel-title" style={{ marginTop: 30 }}><div><span className="eyebrow">ACTIVE RENTALS</span><h2>Books out with readers</h2></div></div>
        {rentals.map(r => <div style={row} key={r._id}>
          <span style={{ ...cell, flex: 1.4 }}>{r.book?.title}</span>
          <span style={cell}>{r.member?.name}</span>
          <span style={{ ...cell, flex: 0.8 }}>due {new Date(r.dueAt).toLocaleDateString()}</span>
        </div>)}
        {!rentals.length && <p style={{ fontSize: 12 }}>No active rentals.</p>}
      </section>}

      {tab === 'Decutler' && <section className="admin-panel">
        <div className="panel-title"><div><span className="eyebrow">DECUTLER MARKETPLACE</span><h2>Reader listings</h2></div></div>
        {listings.map(l => <div style={row} key={l._id}>
          <span style={{ ...cell, flex: 1.6 }}>{l.title}</span>
          <span style={cell}>{l.seller?.name}</span>
          <span style={{ ...cell, flex: 0.6 }}>৳{l.price}</span>
          <span style={{ ...cell, flex: 0.6 }}>{l.status}</span>
        </div>)}
        {!listings.length && <p style={{ fontSize: 12 }}>No marketplace listings yet.</p>}
      </section>}

      {tab === 'Orders' && <section className="admin-panel">
        <div className="panel-title"><div><span className="eyebrow">STORE ORDERS</span><h2>Purchases</h2></div></div>
        {orders.map(o => <div key={o._id} style={{ borderBottom: '1px solid var(--line)', padding: '14px 4px' }}>
          <div style={row}>
            <span style={{ ...cell, flex: 1.2 }}>{o.buyer?.name}<br /><small style={{ color: 'var(--muted)' }}>{o.buyer?.email}{o.contactPhone ? ` · ${o.contactPhone}` : ''}</small></span>
            <span style={{ ...cell, flex: 0.6 }}>৳{o.total}</span>
            <Select value={o.orderStatus} onChange={v => changeOrder(o._id, { orderStatus: v })} options={['pending', 'processing', 'ready', 'shipped', 'completed', 'cancelled']} />
            <Select value={o.paymentStatus} onChange={v => changeOrder(o._id, { paymentStatus: v })} options={['pending', 'paid', 'failed', 'refunded']} />
          </div>
          <div style={{ fontSize: 11, marginTop: 6 }}>
            <span style={{ color: 'var(--muted)' }}>Items: </span>
            {o.items?.map(it => `${it.title || it.book?.title} x${it.quantity}`).join(', ')}
          </div>
          <div style={{ fontSize: 11, marginTop: 4 }}>
            <span style={{ color: 'var(--muted)' }}>Delivery: </span>{o.deliveryMethod}{o.deliveryAddress ? ` — ${o.deliveryAddress}` : ''}
          </div>
          {o.notes && <div style={{ fontSize: 11, marginTop: 4 }}><span style={{ color: 'var(--muted)' }}>Notes: </span>{o.notes}</div>}
        </div>)}
        {!orders.length && <p style={{ fontSize: 12 }}>No orders yet.</p>}
      </section>}

      {tab === 'Restoration' && <section className="admin-panel">
        <div className="panel-title"><div><span className="eyebrow">RESTORATION</span><h2>Requests</h2></div></div>
        {restorations.map(r => <div style={row} key={r._id}>
          <span style={{ ...cell, flex: 1.2 }}>{r.name}</span>
          <span style={{ ...cell, flex: 1.4 }}>{r.bookTitle}</span>
          <span style={{ ...cell, flex: 0.8 }}>{r.service}</span>
          <Select value={r.status} onChange={v => changeRestoration(r._id, v)} options={['new', 'reviewing', 'quoted', 'accepted', 'in_progress', 'completed', 'cancelled']} />
        </div>)}
        {!restorations.length && <p style={{ fontSize: 12 }}>No restoration requests yet.</p>}
      </section>}

      {tab === 'Blind Date' && <>
        <section className="admin-panel" style={{ marginBottom: 15 }}>
          <div className="panel-title"><div><span className="eyebrow">ALREADY-READ CHECKLIST</span><h2>Books per package, genre &amp; language</h2></div></div>
          <form onSubmit={addBdOption} className="form-grid" style={{ marginTop: 20 }}>
            <label>Package
              <select value={bdOptionForm.packageCategory} onChange={e => setBdOptionForm({ ...bdOptionForm, packageCategory: e.target.value })}>
                {BD_PACKS.map(p => <option key={p}>{p}</option>)}
              </select>
            </label>
            <label>Genre
              <select value={bdOptionForm.genre} onChange={e => setBdOptionForm({ ...bdOptionForm, genre: e.target.value })}>
                {BD_GENRES.map(g => <option key={g}>{g}</option>)}
              </select>
            </label>
            <label>Language
              <select value={bdOptionForm.language} onChange={e => setBdOptionForm({ ...bdOptionForm, language: e.target.value })}>
                <option>Bangla</option><option>English</option>
              </select>
            </label>
            <label>Book title
              <input required value={bdOptionForm.title} onChange={e => setBdOptionForm({ ...bdOptionForm, title: e.target.value })} placeholder="e.g. অসচরাচর or Pride and Prejudice" />
            </label>
            <div style={{ gridColumn: '1/-1' }}><button className="btn primary" disabled={bdOptionBusy}>{bdOptionBusy ? 'Adding…' : 'Add to checklist'}</button></div>
          </form>

          {BD_PACKS.map(pack => {
            const packOptions = bdOptions.filter(o => o.packageCategory === pack);
            if (!packOptions.length) return null;
            return <div key={pack} style={{ marginTop: 25 }}>
              <h3 style={{ fontSize: 14, marginBottom: 6 }}>{pack}</h3>
              {BD_GENRES.map(genre => {
                const genreOptions = packOptions.filter(o => o.genre === genre);
                if (!genreOptions.length) return null;
                return <div key={genre} style={{ marginBottom: 10 }}>
                  <p style={{ fontSize: 11, color: 'var(--muted)', margin: '6px 0' }}>{genre}</p>
                  {genreOptions.map(o => <div style={row} key={o._id}>
                    <span style={{ ...cell, flex: 0.5 }}>{o.language}</span>
                    <span style={{ ...cell, flex: 1.5 }}>{o.title}</span>
                    <button style={btn} onClick={() => removeBdOption(o._id)}><X size={12} /> Remove</button>
                  </div>)}
                </div>;
              })}
            </div>;
          })}
          {!bdOptions.length && <p style={{ fontSize: 12, marginTop: 20 }}>No checklist titles added yet — use the form above.</p>}
        </section>

        <section className="admin-panel">
          <div className="panel-title"><div><span className="eyebrow">BLIND DATE</span><h2>Orders</h2></div></div>
          {blindDates.map(b => <div key={b._id} style={{ borderBottom: '1px solid var(--line)', padding: '14px 4px' }}>
            <div style={row}>
              <span style={{ ...cell, flex: 1.2 }}>{b.name}<br /><small style={{ color: 'var(--muted)' }}>{b.email}</small></span>
              <span style={{ ...cell, flex: 0.8 }}>{b.packageCategory} · {b.language}</span>
              <span style={{ ...cell, flex: 0.8 }}>{b.genre}</span>
              <span style={{ ...cell, flex: 0.6 }}>৳{b.price}</span>
              <Select value={b.status} onChange={v => changeBlindDate(b._id, v)} options={['pending', 'confirmed', 'packed', 'shipped', 'completed', 'cancelled']} />
            </div>
            <div style={{ fontSize: 11, marginTop: 6 }}>
              <span style={{ color: 'var(--muted)' }}>Already read: </span>
              {b.alreadyRead?.length ? b.alreadyRead.join(', ') : <em style={{ fontStyle: 'italic', color: 'var(--muted)' }}>none selected</em>}
            </div>
            {b.notes && <div style={{ fontSize: 11, marginTop: 4 }}><span style={{ color: 'var(--muted)' }}>Notes: </span>{b.notes}</div>}
          </div>)}
          {!blindDates.length && <p style={{ fontSize: 12 }}>No blind date orders yet.</p>}
        </section>
      </>}
    </div>
  </div>;
}