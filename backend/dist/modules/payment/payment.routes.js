"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("./payment.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const ctrl = new payment_controller_1.PaymentController();
// Razorpay webhook — signature verification uses req.rawBody, captured by
// the global express.json() verify hook in app.ts (the global JSON parser
// runs before any route-level middleware, so a route-local express.raw()
// here would receive an already-drained stream and never see raw bytes).
router.post('/webhook', ctrl.webhook.bind(ctrl));
// Authenticated routes
router.post('/create-order', auth_middleware_1.authenticate, ctrl.createOrder.bind(ctrl));
router.post('/verify', auth_middleware_1.authenticate, ctrl.verify.bind(ctrl));
router.post('/refund', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('super_admin', 'admin'), ctrl.refund.bind(ctrl));
exports.default = router;
//# sourceMappingURL=payment.routes.js.map