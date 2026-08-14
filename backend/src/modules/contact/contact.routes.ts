import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { ContactController } from './contact.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();
const ctrl = new ContactController();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many messages sent. Please try again later.' }
});

router.post('/', contactLimiter, ctrl.create.bind(ctrl));
router.get('/', authenticate, authorize('super_admin', 'admin'), ctrl.getAll.bind(ctrl));
router.patch('/:id/status', authenticate, authorize('super_admin', 'admin'), ctrl.updateStatus.bind(ctrl));

export default router;
