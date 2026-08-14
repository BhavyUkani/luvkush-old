import { body } from 'express-validator';

// Mirrors the frontend's own Reactive Forms validators (register/login/
// reset-password components) so the server actually enforces what the UI
// only used to suggest — a request sent straight to the API, bypassing the
// browser form entirely, used to sail through with a 1-character password.
export const registerValidators = [
  body('first_name').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('last_name').optional({ values: 'falsy' }).trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('email').trim().isEmail().withMessage('A valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('phone').optional({ values: 'falsy' }).matches(/^[6-9]\d{9}$/).withMessage('Phone must be a valid 10-digit Indian mobile number')
];

export const loginValidators = [
  body('email').trim().isEmail().withMessage('A valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

export const forgotPasswordValidators = [
  body('email').trim().isEmail().withMessage('A valid email is required')
];

export const resetPasswordValidators = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];
