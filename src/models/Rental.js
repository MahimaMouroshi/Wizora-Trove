import mongoose from 'mongoose';

const rentalSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rentedAt: { type: Date, default: Date.now },
  dueAt: { type: Date, required: true },
  returnedAt: Date,
  rentalFee: { type: Number, required: true },
  lateFee: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'returned', 'lost', 'damaged'], default: 'active' },
  conditionOut: String,
  conditionIn: String,
  notes: String
}, { timestamps: true });

rentalSchema.index({ member: 1, status: 1 });
rentalSchema.index({ book: 1, status: 1 });

export const Rental = mongoose.model('Rental', rentalSchema);
