import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    type: { type: String, enum: ['buy', 'rent'], required: true },
    quantity: { type: Number, default: 1, min: 1 },
    unitPrice: { type: Number, required: true }, // selling price OR rent price
    rentDays: { type: Number }, // only for rentals
  },
  { timestamps: true }
);

export default mongoose.models.CartItem || mongoose.model('CartItem', cartItemSchema);