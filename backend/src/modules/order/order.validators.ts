import { body } from 'express-validator';

const PAYMENT_METHODS = ['cod', 'online', 'razorpay'];
const SHIPPING_METHODS = ['standard', 'express'];

export const createOrderValidators = [
  body('payment_method').isIn(PAYMENT_METHODS).withMessage(`payment_method must be one of: ${PAYMENT_METHODS.join(', ')}`),
  body('shipping_method').optional({ values: 'falsy' }).isIn(SHIPPING_METHODS).withMessage(`shipping_method must be one of: ${SHIPPING_METHODS.join(', ')}`),
  body('coupon_code').optional({ values: 'falsy' }).trim().isString(),
  body('notes').optional({ values: 'falsy' }).trim().isLength({ max: 1000 }).withMessage('notes must be at most 1000 characters'),
  body('address_id').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('address_id must be a valid id')
];
