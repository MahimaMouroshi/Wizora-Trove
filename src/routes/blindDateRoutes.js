import { Router } from 'express';
import Joi from 'joi';
import { createBlindDate, myBlindDates, listOptionsPublic } from '../controllers/blindDateController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
const schema = Joi.object({ name: Joi.string().max(80).required(), email: Joi.string().email().required(), packageCategory: Joi.string().required(), language: Joi.string().valid('Bangla', 'English').required(), genre: Joi.string().required(), alreadyRead: Joi.array().items(Joi.string().max(150)), notes: Joi.string().max(1000).allow(''), price: Joi.number().min(0).required() });
router.get('/options', asyncHandler(listOptionsPublic));
router.post('/', protect, validate(schema), asyncHandler(createBlindDate));
router.get('/mine', protect, asyncHandler(myBlindDates));
export default router;