"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("./order.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const order_validators_1 = require("./order.validators");
const router = (0, express_1.Router)();
const ctrl = new order_controller_1.OrderController();
// Public status route
router.get('/statuses', ctrl.getAllStatuses.bind(ctrl));
// Customer routes
router.post('/', auth_middleware_1.authenticate, order_validators_1.createOrderValidators, validate_middleware_1.validate, ctrl.create.bind(ctrl));
router.get('/my', auth_middleware_1.authenticate, ctrl.getMyOrders.bind(ctrl));
router.get('/my/:id', auth_middleware_1.authenticate, ctrl.getMyOrder.bind(ctrl));
router.get('/my/:id/status-history', auth_middleware_1.authenticate, ctrl.getMyOrderStatusHistory.bind(ctrl));
router.get('/track/:orderNumber', auth_middleware_1.authenticate, ctrl.getByOrderNumber.bind(ctrl));
router.post('/my/:id/cancel', auth_middleware_1.authenticate, ctrl.cancelOrder.bind(ctrl));
router.delete('/my/:id/abort-payment', auth_middleware_1.authenticate, ctrl.abortPayment.bind(ctrl));
// Admin routes
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('super_admin', 'admin'), ctrl.adminGetAll.bind(ctrl));
router.get('/status-counts', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('super_admin', 'admin'), ctrl.getStatusCounts.bind(ctrl));
router.get('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('super_admin', 'admin'), ctrl.adminGetOrder.bind(ctrl));
router.get('/:id/couriers', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('super_admin', 'admin'), ctrl.getCourierRates.bind(ctrl));
router.get('/:id/shipment-tracking', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('super_admin', 'admin'), ctrl.getShipmentTracking.bind(ctrl));
router.post('/:id/book-shipment', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('super_admin', 'admin'), ctrl.bookShipment.bind(ctrl));
router.get('/:id/status-history', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('super_admin', 'admin'), ctrl.getStatusHistory.bind(ctrl));
router.patch('/:id/status', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('super_admin', 'admin'), ctrl.updateStatus.bind(ctrl));
router.patch('/:id/tracking', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('super_admin', 'admin'), ctrl.updateTracking.bind(ctrl));
router.patch('/status-history/:historyId', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('super_admin', 'admin'), ctrl.updateStatusHistory.bind(ctrl));
router.delete('/status-history/:historyId', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('super_admin', 'admin'), ctrl.deleteStatusHistory.bind(ctrl));
exports.default = router;
//# sourceMappingURL=order.routes.js.map