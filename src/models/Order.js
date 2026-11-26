import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    title: String,
    quantity: { type: Number, default: 1 },
    unitPrice: Number
  }],
  total: { type: Number, required: true },
  type: { type: String, enum: ['store', 'membership', 'library_fee', 'other'], default: 'store' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  orderStatus: { type: String, enum: ['pending', 'processing', 'ready', 'shipped', 'completed', 'cancelled'], default: 'pending' },
  deliveryMethod: String,
  deliveryAddress: String,
  contactPhone: String,
  notes: String
}, { timestamps: true });

export const Order = mongoose.model('Order', orderSchema);