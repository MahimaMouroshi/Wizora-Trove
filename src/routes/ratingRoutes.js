import { Router } from 'express';
import Joi from 'joi';
import { rateBook, getRatings } from '../controllers/ratingController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.get('/:bookId', asyncHandler(getRatings));
router.post('/:bookId', protect, validate(Joi.object({ rating: Joi.number().integer().min(1).max(5).required(), review: Joi.string().max(1000).allow('') })), asyncHandler(rateBook));
export default router;
