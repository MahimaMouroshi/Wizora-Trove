import { Rental } from '../models/Rental.js';
import { Book } from '../models/Book.js';
import { ReadingLog } from '../models/ReadingLog.js';

export async function dashboard(req, res) {
  const [rentals, books, logs] = await Promise.all([
    Rental.find({ member: req.user._id }).sort({ rentedAt: -1 }).limit(10).populate('book'),
    Book.find({ _id: { $in: req.user.reading.readBooks || [] } }).limit(12),
    ReadingLog.find({ user: req.user._id }).sort({ dateKey: -1 }).limit(30)
  ]);
  res.json({ success: true, profile: req.user.toSafeJSON(), recentRentals: rentals, bookshelf: books, readingLogs: logs });
}

export async function logReading(req, res) {
  const { dateKey, minutes, bookId } = req.body;
  const log = await ReadingLog.findOneAndUpdate(
    { user: req.user._id, dateKey },
    { $inc: { minutes: Number(minutes) || 0 }, ...(bookId ? { book: bookId } : {}) },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  const today = new Date(dateKey);
  req.user.reading.totalMinutes += Number(minutes) || 0;
  if (!req.user.reading.lastReadDate || today > req.user.reading.lastReadDate) {
    const previous = req.user.reading.lastReadDate;
    const diff = previous ? Math.round((today - previous) / 86400000) : null;
    req.user.reading.streak = diff === 1 ? req.user.reading.streak + 1 : 1;
    req.user.reading.longestStreak = Math.max(req.user.reading.longestStreak, req.user.reading.streak);
    req.user.reading.lastReadDate = today;
  }
  if (bookId && !req.user.reading.readBooks.some(id => id.toString() === bookId)) req.user.reading.readBooks.push(bookId);
  await req.user.save();
  res.json({ success: true, log, reading: req.user.reading });
}
