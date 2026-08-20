"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const auth_validators_1 = require("./auth.validators");
const express_rate_limit_1 = require("express-rate-limit");
const router = (0, express_1.Router)();
const ctrl = new auth_controller_1.AuthController();
// Stricter rate limit for auth endpoints
const authLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { success: false, message: 'Too many auth attempts. Please try again later.' }
});
router.post('/register', authLimiter, auth_validators_1.registerValidators, validate_middleware_1.validate, ctrl.register.bind(ctrl));
router.post('/login', authLimiter, auth_validators_1.loginValidators, validate_middleware_1.validate, ctrl.login.bind(ctrl));
router.post('/refresh-token', ctrl.refreshToken.bind(ctrl));
router.post('/logout', auth_middleware_1.authenticate, ctrl.logout.bind(ctrl));
router.post('/forgot-password', authLimiter, auth_validators_1.forgotPasswordValidators, validate_middleware_1.validate, ctrl.forgotPassword.bind(ctrl));
router.post('/reset-password', auth_validators_1.resetPasswordValidators, validate_middleware_1.validate, ctrl.resetPassword.bind(ctrl));
router.post('/verify-email', ctrl.verifyEmail.bind(ctrl));
router.get('/me', auth_middleware_1.authenticate, ctrl.getMe.bind(ctrl));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map