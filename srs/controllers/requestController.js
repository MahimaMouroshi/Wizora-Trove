import { BookRequest } from '../models/BookRequest.js';
import { ApiError } from '../utils/apiError.js';

export async function listRequests(req, res) {
  const requests = await BookRequest.find({ status: { $nin: ['rejected', 'completed'] } }).sort({ createdAt: 1 }).populate('requester supporters queue', 'name email');
  res.json({ success: true, requests });
}

export async function createRequest(req, res) {
  const { bookTitle, author, isbn, coverUrl } = req.body;
  let request = await BookRequest.findOne({ bookTitle: new RegExp(`^${bookTitle}$`, 'i'), status: { $in: ['collecting', 'confirmed', 'ordered'] } });
  if (!request) {
    request = await BookRequest.create({ bookTitle, author, isbn, coverUrl, requester: req.user._id, supporters: [req.user._id], queue: [req.user._id] });
  } else if (request.supporters.some(id => id.toString() === req.user._id.toString())) {
    throw new ApiError(409, 'You already requested this book.');
  } else {
    request.supporters.push(req.user._id);
    request.queue.push(req.user._id);
    if (request.supporters.length >= 5 && request.status === 'collecting') request.status = 'confirmed';
    await request.save();
  }
  res.status(201).json({ success: true, request });
}

export async function myRequests(req, res) {
  const requests = await BookRequest.find({ $or: [{ requester: req.user._id }, { supporters: req.user._id }] }).sort({ createdAt: -1 });
  res.json({ success: true, requests });
}
