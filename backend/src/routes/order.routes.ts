import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
const ctrl = new OrderController();

// Public status route
router.get('/statuses', ctrl.getAllStatuses.bind(ctrl));

// Customer routes
router.post('/', authenticate, ctrl.create.bind(ctrl));
router.get('/my', authenticate, ctrl.getMyOrders.bind(ctrl));
router.get('/my/:id', authenticate, ctrl.getMyOrder.bind(ctrl));
router.get('/my/:id/status-history', authenticate, ctrl.getMyOrderStatusHistory.bind(ctrl));
router.get('/track/:orderNumber', authenticate, ctrl.getByOrderNumber.bind(ctrl));
router.post('/my/:id/cancel', authenticate, ctrl.cancelOrder.bind(ctrl));
router.delete('/my/:id/abort-payment', authenticate, ctrl.abortPayment.bind(ctrl));

// Admin routes
router.get('/', authenticate, authorize('super_admin', 'admin'), ctrl.adminGetAll.bind(ctrl));
router.get('/status-counts', authenticate, authorize('super_admin', 'admin'), ctrl.getStatusCounts.bind(ctrl));
router.get('/:id', authenticate, authorize('super_admin', 'admin'), ctrl.adminGetOrder.bind(ctrl));
router.get('/:id/couriers', authenticate, authorize('super_admin', 'admin'), ctrl.getCourierRates.bind(ctrl));
router.get('/:id/shipment-tracking', authenticate, authorize('super_admin', 'admin'), ctrl.getShipmentTracking.bind(ctrl));
router.post('/:id/book-shipment', authenticate, authorize('super_admin', 'admin'), ctrl.bookShipment.bind(ctrl));
router.get('/:id/status-history', authenticate, authorize('super_admin', 'admin'), ctrl.getStatusHistory.bind(ctrl));
router.patch('/:id/status', authenticate, authorize('super_admin', 'admin'), ctrl.updateStatus.bind(ctrl));
router.patch('/:id/tracking', authenticate, authorize('super_admin', 'admin'), ctrl.updateTracking.bind(ctrl));
router.patch('/status-history/:historyId', authenticate, authorize('super_admin', 'admin'), ctrl.updateStatusHistory.bind(ctrl));
router.delete('/status-history/:historyId', authenticate, authorize('super_admin', 'admin'), ctrl.deleteStatusHistory.bind(ctrl));

export default router;
