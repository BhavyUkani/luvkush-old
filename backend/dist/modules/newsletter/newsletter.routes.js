"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = require("express-rate-limit");
const newsletter_controller_1 = require("./newsletter.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const ctrl = new newsletter_controller_1.NewsletterController();
const subscribeLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: 'Too many requests. Please try again later.' }
});
router.post('/subscribe', subscribeLimiter, ctrl.subscribe.bind(ctrl));
router.post('/unsubscribe', subscribeLimiter, ctrl.unsubscribe.bind(ctrl));
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('super_admin', 'admin'), ctrl.getAll.bind(ctrl));
exports.default = router;
//# sourceMappingURL=newsletter.routes.js.map