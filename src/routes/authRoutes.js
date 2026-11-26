import { Router } from 'express';
import Joi from 'joi';
import { register, login, me, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
const registerSchema = Joi.object({ name: Joi.string().min(2).max(80).required(), email: Joi.string().email().required(), password: Joi.string().min(8).required(), phone: Joi.string().max(30).allow(''), university: Joi.string().max(100).allow('') });
const loginSchema = Joi.object({ email: Joi.string().email().required(), password: Joi.string().required() });

router.post('/register', validate(registerSchema), asyncHandler(register));
router.post('/login', validate(loginSchema), asyncHandler(login));
router.get('/me', protect, asyncHandler(me));
router.patch('/profile', protect, asyncHandler(updateProfile));
export default router;
