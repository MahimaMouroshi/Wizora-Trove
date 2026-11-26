import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    genre: { type: String, trim: true, lowercase: true },
    language: { type: String, default: 'English' },
    description: { type: String, default: '' },
    coverUrl: { type: String, default: '' },          // cover (first picture)
    images: [{ type: String }],                       // all pictures
    condition: { type: String, default: 'good' },
    source: { type: String, enum: ['library', 'store', 'both'], default: 'library', index: true },
    purchasePrice: { type: Number, min: 0 },
    sellingPrice: { type: Number, min: 0 },           // used when BOUGHT from the store
    rentalFee: { type: Number, min: 0, default: 20 }, // used when RENTED from the library
    rentDays: { type: Number, default: 14, min: 1 },
    libraryCopies: { type: Number, default: 1, min: 0 },
    stock: { type: Number, default: 20, min: 0 },     // store copies
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, strict: false }
);

export const Book = mongoose.models.Book || mongoose.model('Book', bookSchema);
export default Book;