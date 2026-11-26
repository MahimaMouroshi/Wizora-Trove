import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw new ApiError(401, 'Authentication required.');
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user || user.status !== 'active') throw new ApiError(401, 'Account is unavailable.');
    req.user = user;
    next();
  } catch (err) {
    next(err instanceof ApiError ? err : new ApiError(401, 'Invalid or expired token.'));
  }
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return next(new ApiError(403, 'Admin access required.'));
  next();
}
