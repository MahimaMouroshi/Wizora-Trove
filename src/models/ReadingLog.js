import mongoose from 'mongoose';

const readingLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dateKey: { type: String, required: true },
  minutes: { type: Number, default: 0, min: 0 },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' }
}, { timestamps: true });

readingLogSchema.index({ user: 1, dateKey: 1 }, { unique: true });
export const ReadingLog = mongoose.model('ReadingLog', readingLogSchema);
