import { Router } from 'express';
import Joi from 'joi';
import { listLibrary, getBook, rentBook, myRentals, returnBook, membershipStatus } from '../controllers/libraryController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.get('/', asyncHandler(listLibrary));
router.get('/:id', asyncHandler(getBook));
router.get('/member/rentals', protect, asyncHandler(myRentals));
router.get('/member/status', protect, asyncHandler(membershipStatus));
router.post('/:id/rent', protect, asyncHandler(rentBook));
router.post('/rentals/:id/return', protect, validate(Joi.object({ conditionIn: Joi.string().max(100), status: Joi.string().valid('returned', 'damaged', 'lost'), notes: Joi.string().max(500).allow('') })), asyncHandler(returnBook));
export default router;
