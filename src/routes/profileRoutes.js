import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { dashboard, logReading } from '../controllers/profileController.js';
import Joi from 'joi';
import { validate } from '../middleware/validate.js';

const router = Router();
router.use(protect);
router.get('/dashboard', asyncHandler(dashboard));
router.post('/reading-log', validate(Joi.object({ dateKey: Joi.string().required(), minutes: Joi.number().min(0).max(1440).required(), bookId: Joi.string().optional() })), asyncHandler(logReading));
export default router;
