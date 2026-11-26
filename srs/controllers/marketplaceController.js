import { MarketplaceListing } from '../models/MarketplaceListing.js';
import { ApiError } from '../utils/apiError.js';

export async function listListings(req, res) {
  const { search, condition, status = 'active' } = req.query;
  const filter = { status };
  if (condition) filter.condition = condition;
  if (search) filter.$or = [{ title: new RegExp(search, 'i') }, { author: new RegExp(search, 'i') }];
  const listings = await MarketplaceListing.find(filter).sort({ createdAt: -1 }).populate('seller', 'name university avatarUrl');
  res.json({ success: true, listings });
}

export async function createListing(req, res) {
  const listing = await MarketplaceListing.create({ ...req.body, seller: req.user._id });
  res.status(201).json({ success: true, listing });
}

export async function getListing(req, res) {
  const listing = await MarketplaceListing.findById(req.params.id).populate('seller', 'name university avatarUrl');
  if (!listing) throw new ApiError(404, 'Listing not found.');
  res.json({ success: true, listing });
}

export async function reserveListing(req, res) {
  const listing = await MarketplaceListing.findOneAndUpdate({ _id: req.params.id, status: 'active', seller: { $ne: req.user._id } }, { status: 'reserved', buyer: req.user._id }, { new: true });
  if (!listing) throw new ApiError(409, 'Listing is no longer available.');
  res.json({ success: true, listing });
}

export async function myListings(req, res) {
  const listings = await MarketplaceListing.find({ seller: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, listings });
}

export async function updateListing(req, res) {
  const listing = await MarketplaceListing.findOneAndUpdate({ _id: req.params.id, seller: req.user._id }, req.body, { new: true, runValidators: true });
  if (!listing) throw new ApiError(404, 'Listing not found.');
  res.json({ success: true, listing });
}
