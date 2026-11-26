import { useEffect, useState } from 'react'; import { Gift, Sparkles, ChevronRight } from 'lucide-react'; import { blindDate } from '../lib/api';
const genres = ['Romance', 'Thriller', 'Mystery', 'Classic', 'Supernatural', 'Sci-fi', 'Religious', 'Mythology'];
const packs = [['Basic', '400৳'], ['Moderate', '550৳'], ['Premium', '750৳'], ['Luxury', '1,000৳']];

export default function BlindDate() {
  const [form, setForm] = useState({ name: '', email: '', packageCategory: 'Basic', language: 'English', genre: 'Mystery', alreadyRead: [] });
  const [options, setOptions] = useState([]);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    blindDate.options({ packageCategory: form.packageCategory, genre: form.genre, language: form.language })
      .then(r => setOptions(r.data?.options || r.data || []))
      .catch(() => setOptions([]));
  }, [form.packageCategory, form.genre, form.language]);

  function toggleRead(title) {
    setForm(f => ({ ...f, alreadyRead: f.alreadyRead.includes(title) ? f.alreadyRead.filter(t => t !== title) : [...f.alreadyRead, title] }));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await blindDate.create({ ...form, price: Number(packs.find(p => p[0] === form.packageCategory)?.[1].replace(/[^0-9]/g, '')) });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send your request — please check your details and try again.');
    }
  }

  return <div className="page">
    <section className="blind-hero">
      <div><span className="eyebrow">THE UNKNOWN, WRAPPED.</span><h1>A book.<br /><i>A secret.</i><br />A new story.</h1><p>Choose your language, genre and package. We'll take care of the mystery.</p></div>
      <div className="wrapped-book"><Gift size={32} /><span>DON'T<br />OPEN<br />YET.</span></div>
    </section>
    <section className="section">
      <div className="blind-grid">
        <div>
          <span className="eyebrow">01 / CHOOSE YOUR EXPERIENCE</span>
          <h2>Four ways to meet a book.</h2>
          <div className="pack-list">{packs.map(p => <button type="button" className={form.packageCategory === p[0] ? 'selected' : ''} onClick={() => setForm({ ...form, packageCategory: p[0] })} key={p[0]}><span>{p[0]}</span><b>{p[1]}</b><ChevronRight /></button>)}</div>
        </div>
        <form className="blind-form" onSubmit={submit}>
          <span className="eyebrow">02 / KEEP IT PERSONAL</span>
          <label>Your name<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="So we know who's opening it" /></label>
          <label>Your email<input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="For order updates" /></label>
          <label>Language<select value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}><option>English</option><option>Bangla</option></select></label>
          <label>Genre<select value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })}>{genres.map(g => <option key={g}>{g}</option>)}</select></label>
          <label>Books you've already read <small>Tick anything you've read — we'll skip these</small></label>
          <div className="already-read-list">
            {options.map(o => <label key={o._id} className="check-row"><input type="checkbox" checked={form.alreadyRead.includes(o.title)} onChange={() => toggleRead(o.title)} /> {o.title}</label>)}
            {!options.length && <p style={{ fontSize: 12, opacity: 0.6 }}>No titles listed yet for this combination — we'll surprise you fully!</p>}
          </div>
          <button className="btn primary" type="submit">Wrap my mystery <Sparkles size={16} /></button>
          {error && <p className="error">{error}</p>}
          {sent && <p className="success">Your mystery request is ready. ✦</p>}
        </form>
      </div>
    </section>
  </div>;
}