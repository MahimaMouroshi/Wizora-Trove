import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const BOOKS = `${API}/api/shop/books`;

// Tries the usual places your login might save the token. Add yours if it's different.
const getToken = () =>
  ['token', 'adminToken', 'accessToken', 'authToken']
    .map((k) => localStorage.getItem(k))
    .find(Boolean);

const LANGUAGES = ['English', 'Bangla', 'Other'];
const CONDITIONS = ['new', 'excellent', 'good', 'fair', 'poor'];

const emptyForm = {
  title: '', author: '', genre: '', language: 'English', condition: 'good',
  source: 'store', sellingPrice: '', purchasePrice: '', rentalFee: '20', rentDays: '14',
  libraryCopies: '1', stock: '20', description: '', imageUrl: '',
};

const imgSrc = (p) => (p?.startsWith('/uploads') ? `${API}${p}` : p);

export default function AdminBooks() {
  const [listing, setListing] = useState('store'); // 'store' | 'library'
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState([]);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [saving, setSaving] = useState(false);

  const isLibrary = listing === 'library';
  const showSell = form.source !== 'library';
  const showRent = form.source !== 'store';

  const loadBooks = async () => {
    const res = await fetch(`${BOOKS}?listing=${listing}`);
    setBooks(await res.json());
  };
  useEffect(() => { loadBooks(); /* eslint-disable-next-line */ }, [listing]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const reset = (src = listing) => {
    setForm({ ...emptyForm, source: src });
    setFiles([]); setEditing(null);
    const input = document.getElementById('book-images');
    if (input) input.value = '';
  };

  const switchTab = (tab) => { setListing(tab); reset(tab); setMessage({ text: '', type: '' }); };

  const startEdit = (b) => {
    setEditing(b);
    setForm({
      title: b.title || '', author: b.author || '', genre: b.genre || '',
      language: b.language || 'English', condition: b.condition || 'good',
      source: b.source || 'library',
      sellingPrice: b.sellingPrice ?? '', purchasePrice: b.purchasePrice ?? '',
      rentalFee: b.rentalFee ?? '20', rentDays: String(b.rentDays || 14),
      libraryCopies: String(b.libraryCopies ?? 1), stock: String(b.stock ?? 20),
      description: b.description || '', imageUrl: '',
    });
    setFiles([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setMessage({ text: '', type: '' });

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    files.forEach((f) => data.append('images', f));

    const res = await fetch(editing ? `${BOOKS}/${editing._id}` : BOOKS, {
      method: editing ? 'PUT' : 'POST',
      headers: { Authorization: `Bearer ${getToken()}` }, // no Content-Type: the browser sets it
      body: data,
    });
    const json = await res.json().catch(() => ({}));
    setSaving(false);

    if (res.ok) {
      setMessage({ text: editing ? 'Book updated.' : 'Book added.', type: 'ok' });
      reset(); loadBooks();
    } else {
      setMessage({ text: json.error || 'Something went wrong.', type: 'error' });
    }
  };

  const currentImages = (b) => (b.images?.length ? b.images : b.coverUrl ? [b.coverUrl] : []);

  const removeImage = async (b, img) => {
    if (currentImages(b).length === 1) return alert('A book needs at least one picture.');
    const data = new FormData();
    data.append('removeImages', JSON.stringify([img]));
    const res = await fetch(`${BOOKS}/${b._id}`, {
      method: 'PUT', headers: { Authorization: `Bearer ${getToken()}` }, body: data,
    });
    if (res.ok) { setEditing(await res.json()); loadBooks(); }
  };

  const archiveBook = async (id) => {
    if (!window.confirm('Archive this book? It will no longer show to readers.')) return;
    const res = await fetch(`${BOOKS}/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (res.ok) loadBooks();
  };

  const field = 'w-full rounded-xl border border-purple-200 bg-white px-4 py-3 text-sm outline-none focus:border-purple-400';
  const tab = (a) => `rounded-full px-5 py-2 text-sm font-medium ${a ? 'bg-purple-500 text-white' : 'border border-purple-300 text-purple-700'}`;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex gap-3">
        <button onClick={() => switchTab('store')} className={tab(!isLibrary)}>Store books</button>
        <button onClick={() => switchTab('library')} className={tab(isLibrary)}>Library books</button>
      </div>

      <h1 className="mt-6 text-3xl font-semibold">
        {editing ? 'Edit book' : isLibrary ? 'Add a library book (rent)' : 'Add a store book (sell)'}
      </h1>

      <form onSubmit={submit} className="mt-6 grid gap-4 rounded-2xl bg-white p-6 shadow sm:grid-cols-2">
        <input className={field} name="title" placeholder="Book name" value={form.title} onChange={change} required />
        <input className={field} name="author" placeholder="Author" value={form.author} onChange={change} required />
        <input className={field} name="genre" placeholder="Genre (thriller, romance, fantasy…)" value={form.genre} onChange={change} required />
        <select className={field} name="language" value={form.language} onChange={change}>
          {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
        </select>
        <select className={field} name="condition" value={form.condition} onChange={change}>
          {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className={field} name="source" value={form.source} onChange={change}>
          <option value="store">Store only</option>
          <option value="library">Library only</option>
          <option value="both">Library + Store</option>
        </select>

        {showSell && <>
          <input className={field} name="sellingPrice" type="number" min="0" placeholder="Selling price" value={form.sellingPrice} onChange={change} required />
          <input className={field} name="purchasePrice" type="number" min="0" placeholder="Purchase price (your cost)" value={form.purchasePrice} onChange={change} />
          <input className={field} name="stock" type="number" min="0" placeholder="Store stock" value={form.stock} onChange={change} />
        </>}
        {showRent && <>
          <input className={field} name="rentalFee" type="number" min="0" placeholder="Rental fee" value={form.rentalFee} onChange={change} required />
          <input className={field} name="rentDays" type="number" min="1" placeholder="Rental days" value={form.rentDays} onChange={change} />
          <input className={field} name="libraryCopies" type="number" min="0" placeholder="Library copies" value={form.libraryCopies} onChange={change} />
        </>}

        <textarea className={`${field} sm:col-span-2`} name="description" rows={4} placeholder="Details / description" value={form.description} onChange={change} />

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm">Pictures (up to 4, first one is the cover)</label>
          <input id="book-images" type="file" accept="image/*" multiple className={field}
            onChange={(e) => setFiles(Array.from(e.target.files).slice(0, 4))} />
        </div>
        <input className={`${field} sm:col-span-2`} name="imageUrl" placeholder="Or paste a picture link" value={form.imageUrl} onChange={change} />

        {editing && (
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            {currentImages(editing).map((img) => (
              <div key={img} className="relative">
                <img src={imgSrc(img)} alt="" className="h-24 w-20 rounded-lg object-cover" />
                <button type="button" onClick={() => removeImage(editing, img)}
                  className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-red-500 text-xs text-white">×</button>
              </div>
            ))}
          </div>
        )}

        {message.text && (
          <p className={`text-sm sm:col-span-2 ${message.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>{message.text}</p>
        )}

        <div className="flex gap-3 sm:col-span-2">
          <button disabled={saving} className="rounded-full bg-purple-500 px-6 py-3 text-sm font-medium text-white disabled:opacity-60">
            {saving ? 'Saving…' : editing ? 'Save changes' : isLibrary ? 'Add to library' : 'Add to store'}
          </button>
          {editing && <button type="button" onClick={() => reset()} className="rounded-full border px-6 py-3 text-sm">Cancel</button>}
        </div>
      </form>

      <h2 className="mt-12 text-2xl font-semibold">{isLibrary ? 'Library books' : 'Store books'} ({books.length})</h2>
      <div className="mt-4 space-y-3">
        {books.map((b) => (
          <div key={b._id} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow">
            <img src={imgSrc(currentImages(b)[0])} alt={b.title} className="h-20 w-16 rounded-lg object-cover" />
            <div className="flex-1">
              <p className="font-medium">{b.title}</p>
              <p className="text-xs text-gray-500">{b.author} · {b.language} · {b.genre} · {b.source}</p>
            </div>
            <p className="font-mono text-sm">
              {isLibrary ? `Rent ৳${b.rentalFee ?? '—'} / ${b.rentDays || 14}d` : `Sell ৳${b.sellingPrice ?? '—'}`}
            </p>
            <button onClick={() => startEdit(b)} className="rounded-full border px-3 py-1.5 text-xs">Edit</button>
            <button onClick={() => archiveBook(b._id)} className="rounded-full border border-red-300 px-3 py-1.5 text-xs text-red-500">Archive</button>
          </div>
        ))}
        {!books.length && <p className="text-sm text-gray-500">Nothing here yet.</p>}
      </div>
    </div>
  );
}