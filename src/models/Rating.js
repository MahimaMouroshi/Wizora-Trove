import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, maxlength: 1000, trim: true }
}, { timestamps: true });

ratingSchema.index({ book: 1, user: 1 }, { unique: true });
export const Rating = mongoose.model('Rating', ratingSchema);
