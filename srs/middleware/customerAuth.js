import jwt from 'jsonwebtoken';

export default function customerAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : req.cookies?.token || null;
  if (!token) return res.status(401).json({ error: 'Please log in first.' });

  try {
    const d = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = d.id || d.userId || d._id || d.sub;
    if (!req.userId) return res.status(401).json({ error: 'Invalid session.' });
    next();
  } catch {
    return res.status(401).json({ error: 'Session expired. Log in again.' });
  }
}