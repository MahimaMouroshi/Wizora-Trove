import mongoose from 'mongoose';
import { Rating } from '../models/Rating.js';
import { Book } from '../models/Book.js';
import { Rental } from '../models/Rental.js';
import { ApiError } from '../utils/apiError.js';

export async function rateBook(req, res) {
  const { rating, review } = req.body;
  const hasRead = await Rental.exists({ member: req.user._id, book: req.params.bookId, status: 'returned' });
  if (!hasRead) throw new ApiError(403, 'You can rate a book after returning a rental.');
  const existing = await Rating.findOne({ book: req.params.bookId, user: req.user._id });
  if (existing) { existing.rating = rating; existing.review = review; await existing.save(); }
  else await Rating.create({ book: req.params.bookId, user: req.user._id, rating, review });
  const stats = await Rating.aggregate([{ $match: { book: new mongoose.Types.ObjectId(req.params.bookId) } }, { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }]);
  await Book.findByIdAndUpdate(req.params.bookId, { ratingAverage: Number((stats[0]?.avg || 0).toFixed(2)), ratingCount: stats[0]?.count || 0 });
  res.json({ success: true });
}

export async function getRatings(req, res) {
  const ratings = await Rating.find({ book: req.params.bookId }).sort({ createdAt: -1 }).populate('user', 'name avatarUrl');
  res.json({ success: true, ratings });
}
