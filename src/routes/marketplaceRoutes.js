import { Router } from 'express';
import Joi from 'joi';
import { listListings, createListing, getListing, reserveListing, myListings, updateListing } from '../controllers/marketplaceController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
const schema = Joi.object({ title: Joi.string().max(200).required(), author: Joi.string().max(150).allow(''), description: Joi.string().max(1000).allow(''), photos: Joi.array().items(Joi.string().uri()), price: Joi.number().min(0).required(), condition: Joi.string().valid('like_new', 'excellent', 'good', 'fair', 'poor').required() });
router.get('/', asyncHandler(listListings));
router.get('/mine', protect, asyncHandler(myListings));
router.get('/:id', asyncHandler(getListing));
router.post('/', protect, validate(schema), asyncHandler(createListing));
router.patch('/:id', protect, asyncHandler(updateListing));
router.post('/:id/reserve', protect, asyncHandler(reserveListing));
export default router;
