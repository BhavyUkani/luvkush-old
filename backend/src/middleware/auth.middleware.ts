import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../utils/config';
import { AppError } from './error.middleware';
import { db } from '../utils/database';

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401));
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, config.jwt.accessSecret) as JwtPayload;

    // Re-check current account state on every request. Verifying the JWT
    // signature alone means a suspension or role change has no effect until
    // the (long-lived) access token expires — this closes that gap at the
    // cost of one indexed lookup per authenticated request.
    const user = await db.queryOne<{ status: string; role: string }>(
      'SELECT status, role FROM users WHERE id = ?',
      [payload.userId]
    );
    if (!user) {
      return next(new AppError('Account no longer exists', 401));
    }
    if (user.status === 'suspended') {
      return next(new AppError('Your account has been suspended. Contact support.', 403));
    }

    req.user = { ...payload, role: user.role };
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(new AppError('Token expired. Please login again.', 401));
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Invalid token', 401));
    }
    next(err);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
    req.user = payload;
  } catch {
    // Continue without auth
  }
  next();
};
