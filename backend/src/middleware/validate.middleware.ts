import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from './error.middleware';

/** Runs after an express-validator chain — collects any accumulated
 * validation errors and turns them into the same AppError/400 shape every
 * other rejected request in this API already returns, instead of each
 * route hand-rolling its own truthy checks. */
export const validate = (req: Request, _res: Response, next: NextFunction): void => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const message = result.array({ onlyFirstError: true })
    .map(err => err.msg)
    .join('; ');
  next(new AppError(message, 400));
};
