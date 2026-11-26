import { Routes, Route, Navigate } from 'react-router-dom'; import { AuthProvider, useAuth } from './context/AuthContext'; import { CartProvider } from './context/CartContext'; import PageShell from './components/PageShell'; import Home from './pages/Home'; import Library from './pages/Library'; import Membership from './pages/Membership'; import Store from './pages/Store'; import BookDetail from './pages/BookDetail'; import Cart from './pages/Cart'; import MyOrders from './pages/MyOrders'; import BlindDate from './pages/BlindDate'; import Decutler from './pages/Decutler'; import Restoration from './pages/Restoration'; import RequestBook from './pages/RequestBook'; import SignIn from './pages/SignIn'; import SignUp from './pages/SignUp'; import Profile from './pages/Profile'; import Admin from './pages/Admin';
import AdminBooks from './pages/AdminBooks';
function Private({ children }) { const { user, loading } = useAuth(); if (loading) return <div className="loading">Opening the Trove…</div>; return user ? children : <Navigate to="/signin" replace />; }
function AdminOnly({ children }) { const { user, loading } = useAuth(); if (loading) return <div className="loading">Opening the Trove…</div>; if (!user) return <Navigate to="/signin" replace />; return user.role === 'admin' ? children : <Navigate to="/profile" replace />; }

function App() {
  return <AuthProvider><CartProvider><Routes>
    <Route path="/signin" element={<SignIn />} />
    <Route path="/signup" element={<SignUp />} />
    <Route path="/" element={<PageShell><Home /></PageShell>} />
    <Route path="/store" element={<PageShell><Store /></PageShell>} />
    <Route path="/book/:id" element={<PageShell><BookDetail /></PageShell>} />
    <Route path="/cart" element={<PageShell><Cart /></PageShell>} />
    <Route path="/orders" element={<Private><PageShell><MyOrders /></PageShell></Private>} />
    <Route path="/library" element={<PageShell><Library /></PageShell>} />
    <Route path="/membership" element={<PageShell><Membership /></PageShell>} />
    <Route path="/blind-date" element={<PageShell><BlindDate /></PageShell>} />
    <Route path="/decutler" element={<PageShell><Decutler /></PageShell>} />
    <Route path="/restoration" element={<PageShell><Restoration /></PageShell>} />
    <Route path="/request" element={<PageShell><RequestBook /></PageShell>} />
    <Route path="/admin/books" element={<AdminBooks />} />
    <Route path="/profile" element={<Private><PageShell><Profile /></PageShell></Private>} />
    <Route path="/admin" element={<AdminOnly><Admin /></AdminOnly>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></CartProvider></AuthProvider>;
}
export default App;