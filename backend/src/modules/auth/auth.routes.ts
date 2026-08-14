import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { registerValidators, loginValidators, forgotPasswordValidators, resetPasswordValidators } from './auth.validators';
import { rateLimit } from 'express-rate-limit';

const router = Router();
const ctrl = new AuthController();

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many auth attempts. Please try again later.' }
});

router.post('/register',         authLimiter, registerValidators, validate, ctrl.register.bind(ctrl));
router.post('/login',            authLimiter, loginValidators, validate, ctrl.login.bind(ctrl));
router.post('/refresh-token',    ctrl.refreshToken.bind(ctrl));
router.post('/logout',           authenticate, ctrl.logout.bind(ctrl));
router.post('/forgot-password',  authLimiter, forgotPasswordValidators, validate, ctrl.forgotPassword.bind(ctrl));
router.post('/reset-password',   resetPasswordValidators, validate, ctrl.resetPassword.bind(ctrl));
router.post('/verify-email',     ctrl.verifyEmail.bind(ctrl));
router.get('/me',                authenticate, ctrl.getMe.bind(ctrl));

export default router;
