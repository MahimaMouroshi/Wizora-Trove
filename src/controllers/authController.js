import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { signToken } from '../utils/authToken.js';

export async function register(req, res) {
  const { name, email, password, phone, university } = req.body;
  if (await User.exists({ email })) throw new ApiError(409, 'An account with this email already exists.');
  const user = await User.create({ name, email, password, phone, university });
  res.status(201).json({ success: true, token: signToken(user), user: user.toSafeJSON() });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) throw new ApiError(401, 'Invalid email or password.');
  if (user.status !== 'active') throw new ApiError(403, 'This account is suspended.');
  res.json({ success: true, token: signToken(user), user: user.toSafeJSON() });
}

export async function me(req, res) {
  res.json({ success: true, user: req.user.toSafeJSON() });
}

export async function updateProfile(req, res) {
  const allowed = ['name', 'phone', 'university', 'avatarUrl', 'dateOfBirth', 'alreadyRead'];
  for (const key of allowed) if (req.body[key] !== undefined) req.user[key] = req.body[key];
  await req.user.save();
  res.json({ success: true, user: req.user.toSafeJSON() });
}
