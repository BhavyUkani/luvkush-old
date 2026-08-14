import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();
const ctrl = new PaymentController();

// Razorpay webhook — signature verification uses req.rawBody, captured by
// the global express.json() verify hook in app.ts (the global JSON parser
// runs before any route-level middleware, so a route-local express.raw()
// here would receive an already-drained stream and never see raw bytes).
router.post('/webhook', ctrl.webhook.bind(ctrl));

// Authenticated routes
router.post('/create-order', authenticate, ctrl.createOrder.bind(ctrl));
router.post('/verify', authenticate, ctrl.verify.bind(ctrl));
router.post('/refund', authenticate, authorize('super_admin', 'admin'), ctrl.refund.bind(ctrl));

export default router;
