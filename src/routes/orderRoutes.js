import { Router } from 'express';
import Joi from 'joi';
import { createStoreOrder, myOrders } from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
const schema = Joi.object({ items: Joi.array().min(1).items(Joi.object({ book: Joi.string().required(), quantity: Joi.number().integer().min(1).max(20).required() })).required(), deliveryMethod: Joi.string().max(50).required(), deliveryAddress: Joi.string().max(500).allow(''), contactPhone: Joi.string().max(30).required(), notes: Joi.string().max(500).allow('') });
router.use(protect);
router.get('/mine', asyncHandler(myOrders));
router.post('/store', validate(schema), asyncHandler(createStoreOrder));
export default router;