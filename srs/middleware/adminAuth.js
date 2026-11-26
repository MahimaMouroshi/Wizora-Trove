import jwt from 'jsonwebtoken';

function readToken(req) {
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) return h.slice(7);
  return req.cookies?.token || null;
}

export default async function adminAuth(req, res, next) {
  const token = readToken(req);
  if (!token) return res.status(401).json({ error: 'Admin login required.' });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Session expired. Log in again.' });
  }

  let role = decoded.role;
  const id = decoded.id || decoded.userId || decoded._id || decoded.sub;
  if (role !== 'admin' && id) {
    try {
      const mod = await import('../models/User.js');
      const User = mod.User || mod.default;
      const u = await User.findById(id).select('role');
      role = u?.role;
    } catch { /* fall through */ }
  }

  if (role !== 'admin') return res.status(403).json({ error: 'Admin access only.' });
  req.admin = decoded;
  next();
}