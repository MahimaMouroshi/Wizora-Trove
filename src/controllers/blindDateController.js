import { BlindDateOrder } from '../models/BlindDateOrder.js';
import { BlindDateBookOption } from '../models/BlindDateBookOption.js';
import { ApiError } from '../utils/apiError.js';

export async function createBlindDate(req, res) {
  const order = await BlindDateOrder.create({ ...req.body, customer: req.user?._id });
  res.status(201).json({ success: true, order });
}

export async function myBlindDates(req, res) {
  const orders = await BlindDateOrder.find({ customer: req.user._id }).sort({ createdAt: -1 }).populate('assignedBook');
  res.json({ success: true, orders });
}

export async function listBlindDates(req, res) {
  const orders = await BlindDateOrder.find().sort({ createdAt: -1 }).populate('customer', 'name email').populate('assignedBook', 'title author');
  res.json({ success: true, orders });
}

export async function updateBlindDate(req, res) {
  const order = await BlindDateOrder.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!order) throw new ApiError(404, 'Blind Date order not found.');
  res.json({ success: true, order });
}

// Public: books available to tick as "already read" for a given package/genre/language
export async function listOptionsPublic(req, res) {
  const { packageCategory, genre, language } = req.query;
  const filter = {};
  if (packageCategory) filter.packageCategory = packageCategory;
  if (genre) filter.genre = genre;
  if (language) filter.language = language;
  const options = await BlindDateBookOption.find(filter).sort({ title: 1 });
  res.json({ success: true, options });
}

// Admin: manage the full checklist pool
export async function listAllOptions(req, res) {
  const options = await BlindDateBookOption.find().sort({ packageCategory: 1, genre: 1, language: 1, title: 1 });
  res.json({ success: true, options });
}

export async function createOption(req, res) {
  const option = await BlindDateBookOption.create(req.body);
  res.status(201).json({ success: true, option });
}

export async function deleteOption(req, res) {
  const option = await BlindDateBookOption.findByIdAndDelete(req.params.id);
  if (!option) throw new ApiError(404, 'Checklist entry not found.');
  res.json({ success: true, message: 'Removed.' });
}