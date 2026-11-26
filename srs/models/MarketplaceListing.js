import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  author: String,
  description: String,
  photos: [String],
  price: { type: Number, required: true, min: 0 },
  condition: { type: String, enum: ['like_new', 'excellent', 'good', 'fair', 'poor'], required: true },
  status: { type: String, enum: ['active', 'reserved', 'sold', 'removed'], default: 'active' },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const MarketplaceListing = mongoose.model('MarketplaceListing', listingSchema);
