import { Request, Response, NextFunction } from 'express';
/** Runs after an express-validator chain — collects any accumulated
 * validation errors and turns them into the same AppError/400 shape every
 * other rejected request in this API already returns, instead of each
 * route hand-rolling its own truthy checks. */
export declare const validate: (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=validate.middleware.d.ts.map