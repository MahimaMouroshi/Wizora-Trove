import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  packageCategory: { type: String, enum: ['Basic', 'Moderate', 'Premium', 'Luxury'], required: true },
  genre: { type: String, required: true, trim: true },
  language: { type: String, enum: ['Bangla', 'English'], required: true },
  title: { type: String, required: true, trim: true }
}, { timestamps: true });

optionSchema.index({ packageCategory: 1, genre: 1, language: 1 });

export const BlindDateBookOption = mongoose.model('BlindDateBookOption', optionSchema);