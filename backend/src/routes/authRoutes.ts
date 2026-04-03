import express from 'express';
import { loginUser, getUserProfile, logoutUser } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.post('/logout', protect, logoutUser);

export default router;
