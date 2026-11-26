import express from 'express';
import fs from 'fs';
import path from 'path';
import Book from '../models/Book.js';
import adminAuth from '../middleware/adminAuth.js';
import { upload, uploadDir } from '../middleware/upload.js';

const router = express.Router();

const num = (v) => (v === undefined || v === '' || v === null ? undefined : Number(v));

function removeFiles(paths = []) {
  paths.forEach((p) => {
    if (p && p.startsWith('/uploads/')) fs.unlink(path.join(uploadDir, path.basename(p)), () => {});
  });
}

// PUBLIC: ?listing=library|store  ?genre=romance  ?language=Bangla
router.get('/', async (req, res) => {
  try {
    const filter = { isActive: { $ne: false } };
    if (req.query.listing === 'library') filter.source = { $in: ['library', 'both'] };
    if (req.query.listing === 'store') filter.source = { $in: ['store', 'both'] };
    if (req.query.genre) filter.genre = req.query.genre.toLowerCase();
    if (req.query.language) filter.language = new RegExp(`^${req.query.language}$`, 'i');
    res.json(await Book.find(filter).sort({ createdAt: -1 }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found.' });
    res.json(book);
  } catch {
    res.status(400).json({ error: 'Invalid book id.' });
  }
});

// ADMIN: add a book
router.post('/', adminAuth, upload.array('images', 4), async (req, res) => {
  const uploaded = (req.files || []).map((f) => `/uploads/${f.filename}`);
  try {
    const b = req.body;
    const source = b.source || 'library';
    if (!['library', 'store', 'both'].includes(source)) throw new Error('Invalid source.');
    if (source !== 'library' && num(b.sellingPrice) === undefined) throw new Error('Selling price is required for store books.');
    if (source !== 'store' && num(b.rentalFee) === undefined) throw new Error('Rental fee is required for library books.');

    const images = [...uploaded];
    if (b.imageUrl) images.push(b.imageUrl.trim());
    if (b.coverUrl) images.push(b.coverUrl.trim());
    if (!images.length) throw new Error('Add at least one picture.');

    const book = await Book.create({
      title: b.title, author: b.author, genre: b.genre, language: b.language || 'English',
      description: b.description, condition: b.condition || 'good', source,
      purchasePrice: num(b.purchasePrice), sellingPrice: num(b.sellingPrice),
      rentalFee: num(b.rentalFee) ?? 20, rentDays: num(b.rentDays) ?? 14,
      libraryCopies: num(b.libraryCopies) ?? 1, stock: num(b.stock) ?? 20,
      images, coverUrl: images[0],
    });
    res.status(201).json(book);
  } catch (err) {
    removeFiles(uploaded);
    res.status(400).json({ error: err.message });
  }
});

// ADMIN: edit a book
router.put('/:id', adminAuth, upload.array('images', 4), async (req, res) => {
  const uploaded = (req.files || []).map((f) => `/uploads/${f.filename}`);
  try {
    const book = await Book.findById(req.params.id);
    if (!book) { removeFiles(uploaded); return res.status(404).json({ error: 'Book not found.' }); }

    const b = req.body;
    ['title', 'author', 'language', 'description', 'condition'].forEach((k) => { if (b[k] !== undefined) book[k] = b[k]; });
    if (b.genre !== undefined) book.genre = b.genre;
    if (b.source && ['library', 'store', 'both'].includes(b.source)) book.source = b.source;
    ['purchasePrice', 'sellingPrice', 'rentalFee', 'rentDays', 'libraryCopies', 'stock'].forEach((k) => {
      if (num(b[k]) !== undefined) book[k] = num(b[k]);
    });

    if (b.removeImages) {
      const toRemove = JSON.parse(b.removeImages);
      book.images = (book.images || []).filter((i) => !toRemove.includes(i));
      removeFiles(toRemove);
    }
    book.images = [...(book.images || []), ...uploaded];
    if (b.imageUrl) book.images.push(b.imageUrl.trim());
    if (!book.images.length && book.coverUrl) book.images.push(book.coverUrl); // old books with only coverUrl
    if (!book.images.length) throw new Error('A book needs at least one picture.');
    book.coverUrl = book.images[0];

    await book.save();
    res.json(book);
  } catch (err) {
    removeFiles(uploaded);
    res.status(400).json({ error: err.message });
  }
});

// ADMIN: archive (same behaviour as your existing admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!book) return res.status(404).json({ error: 'Book not found.' });
    res.json({ ok: true, book });
  } catch {
    res.status(400).json({ error: 'Invalid book id.' });
  }
});

export default router;