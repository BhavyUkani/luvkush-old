"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../utils/config");
const error_middleware_1 = require("./error.middleware");
const database_1 = require("../utils/database");
function extractToken(req) {
    // The browser client sends the httpOnly cookie automatically; the
    // Authorization header remains a fallback for non-browser API clients
    // (mobile apps, scripts) that can't rely on cookie storage.
    const cookieToken = req.cookies?.['lk_access_token'];
    if (cookieToken)
        return cookieToken;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer '))
        return authHeader.split(' ')[1];
    return undefined;
}
const authenticate = async (req, _res, next) => {
    const token = extractToken(req);
    if (!token) {
        return next(new error_middleware_1.AppError('Authentication required', 401));
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, config_1.config.jwt.accessSecret);
        // Re-check current account state on every request. Verifying the JWT
        // signature alone means a suspension or role change has no effect until
        // the (long-lived) access token expires — this closes that gap at the
        // cost of one indexed lookup per authenticated request.
        const user = await database_1.db.queryOne('SELECT status, role FROM users WHERE id = ?', [payload.userId]);
        if (!user) {
            return next(new error_middleware_1.AppError('Account no longer exists', 401));
        }
        if (user.status === 'suspended') {
            return next(new error_middleware_1.AppError('Your account has been suspended. Contact support.', 403));
        }
        req.user = { ...payload, role: user.role };
        next();
    }
    catch (err) {
        if (err instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return next(new error_middleware_1.AppError('Token expired. Please login again.', 401));
        }
        if (err instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return next(new error_middleware_1.AppError('Invalid token', 401));
        }
        next(err);
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new error_middleware_1.AppError('Authentication required', 401));
        }
        if (!roles.includes(req.user.role)) {
            return next(new error_middleware_1.AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};
exports.authorize = authorize;
const optionalAuth = (req, _res, next) => {
    const token = extractToken(req);
    if (!token) {
        return next();
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, config_1.config.jwt.accessSecret);
        req.user = payload;
    }
    catch {
        // Continue without auth
    }
    next();
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.middleware.js.map