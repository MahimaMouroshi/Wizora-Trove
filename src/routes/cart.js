import express from 'express';
import Book from '../models/Book.js';
import CartItem from '../models/CartItem.js';
import customerAuth from '../middleware/customerAuth.js';

const router = express.Router();
router.use(customerAuth);

router.get('/', async (req, res) => {
  const items = await CartItem.find({ user: req.userId }).populate('book');
  const total = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  res.json({ items, total });
});

// POST { bookId, type? }  type = 'rent' | 'buy' (only needed when the book is both)
router.post('/', async (req, res) => {
  try {
    const book = await Book.findById(req.body.bookId);
    if (!book || book.isActive === false) return res.status(404).json({ error: 'Book not found.' });

    let type = req.body.type;
    if (book.source === 'library') type = 'rent';
    else if (book.source === 'store') type = 'buy';
    else if (!['rent', 'buy'].includes(type)) {
      return res.status(400).json({ error: 'Choose rent or buy for this book.' });
    }

    const isRent = type === 'rent';
    const unitPrice = isRent ? book.rentalFee : book.sellingPrice;
    if (unitPrice == null) return res.status(400).json({ error: 'This book has no price set.' });
    if (isRent && (book.libraryCopies ?? 1) < 1) return res.status(400).json({ error: 'No library copies available.' });
    if (!isRent && (book.stock ?? 1) < 1) return res.status(400).json({ error: 'Out of stock.' });

    let item = await CartItem.findOne({ user: req.userId, book: book._id, type });
    if (item) {
      if (isRent) return res.status(400).json({ error: 'Already in your cart for rent.' });
      item.quantity += 1;
      item.unitPrice = unitPrice;
      await item.save();
    } else {
      item = await CartItem.create({
        user: req.userId, book: book._id, type, unitPrice, quantity: 1,
        rentDays: isRent ? book.rentDays : undefined,
      });
    }
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:itemId', async (req, res) => {
  await CartItem.deleteOne({ _id: req.params.itemId, user: req.userId });
  res.json({ ok: true });
});

export default router;