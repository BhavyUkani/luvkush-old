"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordValidators = exports.forgotPasswordValidators = exports.loginValidators = exports.registerValidators = void 0;
const express_validator_1 = require("express-validator");
// Mirrors the frontend's own Reactive Forms validators (register/login/
// reset-password components) so the server actually enforces what the UI
// only used to suggest — a request sent straight to the API, bypassing the
// browser form entirely, used to sail through with a 1-character password.
exports.registerValidators = [
    (0, express_validator_1.body)('first_name').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
    (0, express_validator_1.body)('last_name').optional({ values: 'falsy' }).trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
    (0, express_validator_1.body)('email').trim().isEmail().withMessage('A valid email is required'),
    (0, express_validator_1.body)('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    (0, express_validator_1.body)('phone').optional({ values: 'falsy' }).matches(/^[6-9]\d{9}$/).withMessage('Phone must be a valid 10-digit Indian mobile number')
];
exports.loginValidators = [
    (0, express_validator_1.body)('email').trim().isEmail().withMessage('A valid email is required'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required')
];
exports.forgotPasswordValidators = [
    (0, express_validator_1.body)('email').trim().isEmail().withMessage('A valid email is required')
];
exports.resetPasswordValidators = [
    (0, express_validator_1.body)('token').notEmpty().withMessage('Reset token is required'),
    (0, express_validator_1.body)('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];
//# sourceMappingURL=auth.validators.js.map