import { Book } from '../models/Book.js';
import { Order } from '../models/Order.js';
import { ApiError } from '../utils/apiError.js';

export async function createStoreOrder(req, res) {
  const { items, deliveryMethod, deliveryAddress, contactPhone, notes } = req.body;
  if (!Array.isArray(items) || !items.length) throw new ApiError(400, 'At least one item is required.');
  const ids = items.map(i => i.book);
  const books = await Book.find({ _id: { $in: ids }, isActive: true, source: { $in: ['store', 'both'] } });
  if (books.length !== ids.length) throw new ApiError(400, 'One or more books are unavailable.');
  const normalized = items.map(i => {
    const book = books.find(b => b._id.toString() === i.book);
    return { book: book._id, title: book.title, quantity: Math.max(1, Number(i.quantity) || 1), unitPrice: book.sellingPrice };
  });
  const total = normalized.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const order = await Order.create({ buyer: req.user._id, items: normalized, total, deliveryMethod, deliveryAddress, contactPhone, notes });
  res.status(201).json({ success: true, order });
}

export async function myOrders(req, res) {
  const orders = await Order.find({ buyer: req.user._id }).sort({ createdAt: -1 }).populate('items.book');
  res.json({ success: true, orders });
}

export async function listOrders(req, res) {
  const orders = await Order.find().sort({ createdAt: -1 }).populate('buyer', 'name email phone').populate('items.book', 'title coverUrl');
  res.json({ success: true, orders });
}

export async function updateOrder(req, res) {
  const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!order) throw new ApiError(404, 'Order not found.');
  res.json({ success: true, order });
}