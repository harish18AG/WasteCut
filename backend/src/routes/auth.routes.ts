import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', authenticate as any, authController.getProfile as any);
router.put('/profile', authenticate as any, authController.updateProfile as any);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/send-email-otp', authController.sendEmailOtp);
router.post('/send-phone-otp', authController.sendPhoneOtp);

export default router;
