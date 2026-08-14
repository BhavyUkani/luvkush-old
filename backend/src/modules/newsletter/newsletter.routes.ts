import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { NewsletterController } from './newsletter.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();
const ctrl = new NewsletterController();

const subscribeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many requests. Please try again later.' }
});

router.post('/subscribe', subscribeLimiter, ctrl.subscribe.bind(ctrl));
router.post('/unsubscribe', subscribeLimiter, ctrl.unsubscribe.bind(ctrl));
router.get('/', authenticate, authorize('super_admin', 'admin'), ctrl.getAll.bind(ctrl));

export default router;
