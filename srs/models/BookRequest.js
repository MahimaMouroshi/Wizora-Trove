import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  bookTitle: { type: String, required: true, trim: true },
  author: { type: String, trim: true },
  isbn: String,
  coverUrl: String,
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  supporters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['collecting', 'confirmed', 'ordered', 'available', 'completed', 'rejected'], default: 'collecting' },
  queue: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  adminNote: String
}, { timestamps: true });

requestSchema.index({ bookTitle: 1, status: 1 });

export const BookRequest = mongoose.model('BookRequest', requestSchema);
