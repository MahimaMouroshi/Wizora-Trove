import { User } from '../models/User.js';
import { Book } from '../models/Book.js';
import { Rental } from '../models/Rental.js';
import { BookRequest } from '../models/BookRequest.js';
import { MarketplaceListing } from '../models/MarketplaceListing.js';
import { Order } from '../models/Order.js';
import { RestorationRequest } from '../models/RestorationRequest.js';
import { BlindDateOrder } from '../models/BlindDateOrder.js';
import { ApiError } from '../utils/apiError.js';
import { makeSlug } from '../utils/slug.js';

export async function listBooks(req, res) {
  const books = await Book.find().sort({ createdAt: -1 });
  res.json({ success: true, books });
}

export async function stats(req, res) {
  const [users, members, books, activeRentals, requests, listings, orders, restorations, blindDates] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ 'membership.expiresAt': { $gt: new Date() }, 'membership.paymentStatus': 'paid' }),
    Book.countDocuments({ isActive: true }),
    Rental.countDocuments({ status: 'active' }),
    BookRequest.countDocuments({ status: { $in: ['collecting', 'confirmed', 'ordered'] } }),
    MarketplaceListing.countDocuments({ status: 'active' }),
    Order.countDocuments({ orderStatus: { $nin: ['completed', 'cancelled'] } }),
    RestorationRequest.countDocuments({ status: { $nin: ['completed', 'cancelled'] } }),
    BlindDateOrder.countDocuments({ status: { $nin: ['completed', 'cancelled'] } })
  ]);
  res.json({ success: true, stats: { users, members, books, activeRentals, requests, listings, orders, restorations, blindDates } });
}

export async function createBook(req, res) {
  const data = { ...req.body, slug: makeSlug(`${req.body.title}-${Date.now()}`) };
  const book = await Book.create(data);
  res.status(201).json({ success: true, book });
}

export async function updateBook(req, res) {
  const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!book) throw new ApiError(404, 'Book not found.');
  res.json({ success: true, book });
}

export async function deleteBook(req, res) {
  const book = await Book.findByIdAndUpdate(req.params.id, { isActive: false, availableCopies: 0 }, { new: true });
  if (!book) throw new ApiError(404, 'Book not found.');
  res.json({ success: true, message: 'Book archived.', book });
}

export async function activateMembership(req, res) {
  const { userId, plan, securityDeposit = 0, paymentStatus = 'paid' } = req.body;
  const months = { '3_month': 3, '6_month': 6, '12_month': 12 }[plan];
  if (!months) throw new ApiError(400, 'Invalid membership plan.');
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found.');
  const startsAt = new Date();
  const expiresAt = new Date(startsAt);
  expiresAt.setMonth(expiresAt.getMonth() + months);
  user.membership = { plan, startsAt, expiresAt, securityDeposit, securityStatus: securityDeposit > 0 ? 'held' : 'none', paymentStatus, idCardNumber: `WT-${Date.now()}` };
  await user.save();
  res.json({ success: true, user: user.toSafeJSON() });
}

export async function updateRequest(req, res) {
  const request = await BookRequest.findById(req.params.id);
  if (!request) throw new ApiError(404, 'Request not found.');
  Object.assign(request, req.body);
  await request.save();
  res.json({ success: true, request });
}

export async function listUsers(req, res) {
  const users = await User.find().sort({ createdAt: -1 }).select('-password');
  res.json({ success: true, users });
}

export async function updateUser(req, res) {
  const allowed = ['role', 'status'];
  const update = {};
  for (const key of allowed) if (req.body[key] !== undefined) update[key] = req.body[key];
  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!user) throw new ApiError(404, 'User not found.');
  res.json({ success: true, user: user.toSafeJSON() });
}

export async function activeRentals(req, res) {
  const rentals = await Rental.find({ status: 'active' }).sort({ dueAt: 1 }).populate('member', 'name email phone').populate('book', 'title author coverUrl');
  res.json({ success: true, rentals });
}

export async function listListings(req, res) {
  const listings = await MarketplaceListing.find().sort({ createdAt: -1 }).populate('seller', 'name email phone');
  res.json({ success: true, listings });
}