import { Router } from 'express';
import Joi from 'joi';
import { getPlans, requestMembership, securityStatus } from '../controllers/membershipController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.get('/plans', asyncHandler(getPlans));
router.post('/request', protect, validate(Joi.object({ plan: Joi.string().valid('3_month', '6_month', '12_month').required() })), asyncHandler(requestMembership));
router.get('/security', protect, asyncHandler(securityStatus));
export default router;
