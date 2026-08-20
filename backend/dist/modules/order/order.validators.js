"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderValidators = void 0;
const express_validator_1 = require("express-validator");
const PAYMENT_METHODS = ['cod', 'online', 'razorpay'];
const SHIPPING_METHODS = ['standard', 'express'];
exports.createOrderValidators = [
    (0, express_validator_1.body)('payment_method').isIn(PAYMENT_METHODS).withMessage(`payment_method must be one of: ${PAYMENT_METHODS.join(', ')}`),
    (0, express_validator_1.body)('shipping_method').optional({ values: 'falsy' }).isIn(SHIPPING_METHODS).withMessage(`shipping_method must be one of: ${SHIPPING_METHODS.join(', ')}`),
    (0, express_validator_1.body)('coupon_code').optional({ values: 'falsy' }).trim().isString(),
    (0, express_validator_1.body)('notes').optional({ values: 'falsy' }).trim().isLength({ max: 1000 }).withMessage('notes must be at most 1000 characters'),
    (0, express_validator_1.body)('address_id').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('address_id must be a valid id')
];
//# sourceMappingURL=order.validators.js.map