import express from 'express';
import { 
  register, 
  login, 
  refresh, 
  logout, 
  logoutAll, 
  verifyEmail, 
  forgotPassword, 
  resetPassword, 
  changePassword 
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);

router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.post('/logout-all', protect, logoutAll);
router.post('/change-password', protect, changePassword);

export default router;
