import { Router } from 'express';
import Joi from 'joi';
import { createRestoration, myRestorations } from '../controllers/restorationController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
const schema = Joi.object({ name: Joi.string().max(80).required(), email: Joi.string().email().required(), phone: Joi.string().max(30).allow(''), bookTitle: Joi.string().max(200).required(), photos: Joi.array().items(Joi.string().uri()), service: Joi.string().valid('restoration', 'paperback_to_hardcover', 'sprayed_edge', 'cloth_binding', 'cover_replacement', 'custom').required(), message: Joi.string().max(1500).allow('') });
router.post('/', protect, validate(schema), asyncHandler(createRestoration));
router.get('/mine', protect, asyncHandler(myRestorations));
export default router;
