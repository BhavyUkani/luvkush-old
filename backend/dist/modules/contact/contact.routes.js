"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = require("express-rate-limit");
const contact_controller_1 = require("./contact.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const ctrl = new contact_controller_1.ContactController();
const contactLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Too many messages sent. Please try again later.' }
});
router.post('/', contactLimiter, ctrl.create.bind(ctrl));
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('super_admin', 'admin'), ctrl.getAll.bind(ctrl));
router.patch('/:id/status', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('super_admin', 'admin'), ctrl.updateStatus.bind(ctrl));
exports.default = router;
//# sourceMappingURL=contact.routes.js.map