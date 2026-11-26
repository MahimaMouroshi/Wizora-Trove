import { Book } from '../models/Book.js';
import { Rental } from '../models/Rental.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';

function membershipActive(user) {
  return user.membership?.expiresAt && new Date(user.membership.expiresAt) > new Date() && user.membership.paymentStatus === 'paid';
}

export async function listLibrary(req, res) {
  const { search, genre, language, sort = '-createdAt', page = 1, limit = 12, source } = req.query;
  const filter = { isActive: true };
  filter.source = source ? { $in: source.split(',').map(s => s.trim()) } : { $in: ['library', 'both'] };
  if (genre) filter.genre = genre;
  if (language) filter.language = language;
  if (search) filter.$or = [{ title: new RegExp(search, 'i') }, { author: new RegExp(search, 'i') }];
  const skip = (Number(page) - 1) * Number(limit);
  const [books, total] = await Promise.all([Book.find(filter).sort(sort).skip(skip).limit(Number(limit)), Book.countDocuments(filter)]);
  res.json({ success: true, books, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
}

export async function getBook(req, res) {
  const book = await Book.findOne({ $or: [{ _id: req.params.id }, { slug: req.params.id }] });
  if (!book) throw new ApiError(404, 'Book not found.');
  res.json({ success: true, book });
}

export async function rentBook(req, res) {
  if (!membershipActive(req.user)) throw new ApiError(403, 'An active library membership is required.');
  const activeCount = await Rental.countDocuments({ member: req.user._id, status: 'active' });
  if (activeCount >= 3) throw new ApiError(400, 'You can have a maximum of 3 active books.');
  const book = await Book.findById(req.params.id);
  if (!book || !book.isActive) throw new ApiError(404, 'Book not found.');
  if (book.availableCopies < 1) throw new ApiError(409, 'This book is currently unavailable.');
  const dueAt = new Date(Date.now() + book.rentalDays * 86400000);
  const rental = await Rental.create({ book: book._id, member: req.user._id, dueAt, rentalFee: book.rentalFee, conditionOut: book.condition });
  book.availableCopies -= 1;
  book.totalRentals += 1;
  await book.save();
  res.status(201).json({ success: true, rental: await rental.populate('book') });
}

export async function myRentals(req, res) {
  const rentals = await Rental.find({ member: req.user._id }).sort({ rentedAt: -1 }).populate('book');
  res.json({ success: true, rentals });
}

export async function returnBook(req, res) {
  const rental = await Rental.findOne({ _id: req.params.id, member: req.user._id, status: 'active' }).populate('book');
  if (!rental) throw new ApiError(404, 'Active rental not found.');
  const returnedAt = new Date();
  const extraMonths = Math.max(0, Math.ceil((returnedAt - rental.dueAt) / (30 * 86400000)));
  rental.returnedAt = returnedAt;
  rental.lateFee = extraMonths * 10;
  rental.conditionIn = req.body.conditionIn || rental.conditionOut;
  rental.notes = req.body.notes;
  rental.status = ['damaged', 'lost'].includes(req.body.status) ? req.body.status : 'returned';
  await rental.save();
  await Book.findByIdAndUpdate(rental.book._id, { $inc: { availableCopies: 1 } });
  res.json({ success: true, rental });
}

export async function membershipStatus(req, res) {
  const user = await User.findById(req.user._id).select('membership name email');
  res.json({ success: true, membership: user.membership || null });
}