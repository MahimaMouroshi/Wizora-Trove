import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';

const plans = {
  '3_month': { months: 3, price: 500 },
  '6_month': { months: 6, price: 800 },
  '12_month': { months: 12, price: 1500 }
};

export function getPlans(req, res) {
  res.json({ success: true, plans });
}

export async function requestMembership(req, res) {
  const { plan } = req.body;
  if (!plans[plan]) throw new ApiError(400, 'Invalid membership plan.');
  res.status(201).json({ success: true, message: 'Membership request created. Payment integration can be connected here.', plan, amount: plans[plan].price });
}

export async function securityStatus(req, res) {
  const user = await User.findById(req.user._id).select('membership');
  res.json({ success: true, membership: user.membership });
}
