import { RestorationRequest } from '../models/RestorationRequest.js';
import { ApiError } from '../utils/apiError.js';

export async function createRestoration(req, res) {
  const request = await RestorationRequest.create({ ...req.body, customer: req.user?._id });
  res.status(201).json({ success: true, request });
}

export async function myRestorations(req, res) {
  const requests = await RestorationRequest.find({ customer: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, requests });
}

export async function listRestorations(req, res) {
  const requests = await RestorationRequest.find().sort({ createdAt: -1 }).populate('customer', 'name email phone');
  res.json({ success: true, requests });
}

export async function updateRestoration(req, res) {
  const request = await RestorationRequest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!request) throw new ApiError(404, 'Restoration request not found.');
  res.json({ success: true, request });
}
