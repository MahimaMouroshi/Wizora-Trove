import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X } from 'lucide-react';
import { useState } from 'react'; import { useAuth } from '../context/AuthContext'; import { useCart } from '../context/CartContext'; import Logo from './Logo';
const links = [['/store', 'Store'], ['/library', 'Trove Library'], ['/blind-date', 'Blind Date'], ['/decutler', 'Decutler'], ['/restoration', 'Restoration']];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState('');
  const { user } = useAuth();
  const cart = useCart();
  const navigate = useNavigate();

  function submitSearch(e) {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/store?q=${encodeURIComponent(q.trim())}`);
    setSearchOpen(false);
  }

  return <header className="nav">
    <Link to="/" className="logo-link"><Logo /></Link>
    <nav className={open ? 'nav-links open' : 'nav-links'}>{links.map(([to, label]) => <NavLink key={to} to={to} onClick={() => setOpen(false)}>{label}</NavLink>)}</nav>
    <div className="nav-actions">
      {searchOpen
        ? <form onSubmit={submitSearch} className="nav-search-form">
          <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search books…" onBlur={() => !q && setSearchOpen(false)} />
        </form>
        : <button className="icon-btn" onClick={() => setSearchOpen(true)}><Search size={19} /></button>}
      <Link to="/cart" className="icon-btn" style={{ position: 'relative' }}>
        <ShoppingBag size={19} />
        {cart?.count > 0 && <span className="cart-badge">{cart.count}</span>}
      </Link>
      {user?.role === 'admin' && <Link className="signin" to="/admin">Admin Studio</Link>}
      {user ? <Link className="avatar" to="/profile">{user.name?.[0] || 'M'}</Link> : <Link className="signin" to="/signin">Sign in</Link>}
      <button className="menu-btn" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    </div>
  </header>;
}