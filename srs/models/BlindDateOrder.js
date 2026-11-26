import mongoose from 'mongoose';

const blindDateSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  packageCategory: { type: String, required: true },
  language: { type: String, enum: ['Bangla', 'English'], required: true },
  genre: { type: String, required: true },
  alreadyRead: [String],
  notes: String,
  price: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'packed', 'shipped', 'completed', 'cancelled'], default: 'pending' },
  assignedBook: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' }
}, { timestamps: true });

export const BlindDateOrder = mongoose.model('BlindDateOrder', blindDateSchema);
