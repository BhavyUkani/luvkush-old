"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFoundHandler = exports.AppError = void 0;
const multer_1 = __importDefault(require("multer"));
const logger_1 = require("../utils/logger");
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const notFoundHandler = (req, res, _next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
};
exports.notFoundHandler = notFoundHandler;
const errorHandler = (err, _req, res, _next) => {
    // Malformed JSON bodies (body-parser) and file-upload violations (multer)
    // are client mistakes, not server failures — map them to clean 4xx
    // responses instead of letting them fall through as raw 500s.
    if (err instanceof multer_1.default.MulterError) {
        const message = err.code === 'LIMIT_FILE_SIZE' ? 'File too large' : err.message;
        const statusCode = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
        logger_1.logger.warn(`Upload error [${statusCode}]: ${message}`);
        res.status(statusCode).json({ success: false, message });
        return;
    }
    if (err.type === 'entity.parse.failed' || err instanceof SyntaxError && 'body' in err) {
        logger_1.logger.warn('Malformed JSON body received');
        res.status(400).json({ success: false, message: 'Malformed JSON in request body' });
        return;
    }
    const statusCode = err.statusCode || 500;
    const isOperational = err.isOperational || false;
    if (!isOperational) {
        logger_1.logger.error('Unexpected error:', err);
    }
    else {
        logger_1.logger.warn(`Operational error [${statusCode}]: ${err.message}`);
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
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.middleware.js.map