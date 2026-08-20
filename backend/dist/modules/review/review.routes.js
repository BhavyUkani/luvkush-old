"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_controller_1 = require("./review.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const ctrl = new review_controller_1.ReviewController();
// Public / product reviews
router.get('/product/:productId', ctrl.getProductReviews.bind(ctrl));
router.get('/product/:productId/summary', ctrl.getRatingSummary.bind(ctrl));
// Authenticated user actions
router.post('/', auth_middleware_1.authenticate, ctrl.create.bind(ctrl));
router.post('/:id/helpful', auth_middleware_1.authenticate, ctrl.markHelpful.bind(ctrl));
// Admin
router.get('/admin', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('super_admin', 'admin'), ctrl.adminGetAll.bind(ctrl));
router.patch('/:id/status', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('super_admin', 'admin'), ctrl.updateStatus.bind(ctrl));
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('super_admin', 'admin'), ctrl.delete.bind(ctrl));
exports.default = router;
//# sourceMappingURL=review.routes.js.map