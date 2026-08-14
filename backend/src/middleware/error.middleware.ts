import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { logger } from '../utils/logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const notFoundHandler = (req: Request, res: Response, _next: NextFunction): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
};

export const errorHandler = (
  err: Error | AppError | (Error & { type?: string; status?: number }),
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Malformed JSON bodies (body-parser) and file-upload violations (multer)
  // are client mistakes, not server failures — map them to clean 4xx
  // responses instead of letting them fall through as raw 500s.
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'File too large' : err.message;
    const statusCode = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    logger.warn(`Upload error [${statusCode}]: ${message}`);
    res.status(statusCode).json({ success: false, message });
    return;
  }
  if ((err as any).type === 'entity.parse.failed' || err instanceof SyntaxError && 'body' in err) {
    logger.warn('Malformed JSON body received');
    res.status(400).json({ success: false, message: 'Malformed JSON in request body' });
    return;
  }

  const statusCode = (err as AppError).statusCode || 500;
  const isOperational = (err as AppError).isOperational || false;

  if (!isOperational) {
    logger.error('Unexpected error:', err);
  } else {
    logger.warn(`Operational error [${statusCode}]: ${err.message}`);
  }

  // Operational errors (AppError) carry messages we deliberately wrote for
  // the client. Anything else — raw MySQL errors, multer errors, etc. — is
  // an implementation detail that must never reach the browser in
  // production: it leaks schema/column names and enables user enumeration.
  const isProd = process.env['NODE_ENV'] === 'production';
  const message = isOperational || !isProd ? (err.message || 'Internal Server Error') : 'Something went wrong. Please try again.';

  res.status(statusCode).json({
    success: false,
    message,
    ...(!isProd && { stack: err.stack })
  });
};
