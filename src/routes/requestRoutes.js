import { Router } from 'express';
import Joi from 'joi';
import { createRequest, listRequests, myRequests } from '../controllers/requestController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { updateRequest } from '../controllers/adminController.js';

const router = Router();
router.use(protect);
router.get('/mine', asyncHandler(myRequests));
router.post('/', validate(Joi.object({ bookTitle: Joi.string().min(1).max(200).required(), author: Joi.string().max(150).allow(''), isbn: Joi.string().max(50).allow(''), coverUrl: Joi.string().uri().allow('') })), asyncHandler(createRequest));
router.get('/admin/all', adminOnly, asyncHandler(listRequests));
router.patch('/admin/:id', adminOnly, asyncHandler(updateRequest));
export default router;
