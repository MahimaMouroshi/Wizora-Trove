import mongoose from 'mongoose';

const restorationSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  phone: String,
  bookTitle: { type: String, required: true, trim: true },
  photos: [String],
  service: { type: String, enum: ['restoration', 'paperback_to_hardcover', 'sprayed_edge', 'cloth_binding', 'cover_replacement', 'custom'], required: true },
  message: String,
  estimatedPrice: Number,
  status: { type: String, enum: ['new', 'reviewing', 'quoted', 'accepted', 'in_progress', 'completed', 'cancelled'], default: 'new' }
}, { timestamps: true });

export const RestorationRequest = mongoose.model('RestorationRequest', restorationSchema);
