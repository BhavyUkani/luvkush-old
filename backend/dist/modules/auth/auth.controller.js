"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const error_middleware_1 = require("../../middleware/error.middleware");
const activity_logger_1 = require("../../utils/activity-logger");
const auth_cookies_1 = require("./auth-cookies");
class AuthController {
    service = new auth_service_1.AuthService();
    async register(req, res, next) {
        try {
            const { first_name, last_name, email, password, phone } = req.body;
            const { user, accessToken, refreshToken } = await this.service.register({ first_name, last_name, email, password, phone });
            (0, auth_cookies_1.setAuthCookies)(res, accessToken, refreshToken);
            res.status(201).json({ success: true, data: { user }, message: 'Account created.' });
        }
        catch (err) {
            next(err);
        }
    }
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const { user, accessToken, refreshToken } = await this.service.login(email, password);
            if (user.role === 'admin' || user.role === 'super_admin') {
                (0, activity_logger_1.logActivity)({ action: 'admin_login', userId: user.id, module: 'auth', newValues: { email: user.email, role: user.role } });
            }
            (0, auth_cookies_1.setAuthCookies)(res, accessToken, refreshToken);
            res.json({ success: true, data: { user } });
        }
        catch (err) {
            next(err);
        }
    }
    async refreshToken(req, res, next) {
        try {
            const refreshToken = req.cookies?.['lk_refresh_token'];
            if (!refreshToken)
                throw new error_middleware_1.AppError('Not authenticated', 401);
            const { accessToken, refreshToken: newRefresh } = await this.service.refreshToken(refreshToken);
            (0, auth_cookies_1.setAuthCookies)(res, accessToken, newRefresh);
            res.json({ success: true });
        }
        catch (err) {
            next(err);
        }
    }
    async logout(req, res, next) {
        try {
            await this.service.logout(req.user.userId);
            (0, auth_cookies_1.clearAuthCookies)(res);
            res.json({ success: true, message: 'Logged out successfully' });
        }
        catch (err) {
            next(err);
        }
    }
    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            await this.service.forgotPassword(email);
            res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
        }
        catch (err) {
            next(err);
        }
    }
    async resetPassword(req, res, next) {
        try {
            const { token, password } = req.body;
            await this.service.resetPassword(token, password);
            res.json({ success: true, message: 'Password reset successfully. Please login.' });
        }
        catch (err) {
            next(err);
        }
    }
    async verifyEmail(req, res, next) {
        try {
            const { token } = req.body;
            if (!token)
                throw new error_middleware_1.AppError('Verification token required', 400);
            await this.service.verifyEmail(token);
            res.json({ success: true, message: 'Email verified successfully!' });
        }
        catch (err) {
            next(err);
        }
    }
    async getMe(req, res, next) {
        try {
            const user = await this.service.getUserById(req.user.userId);
            if (!user)
                throw new error_middleware_1.AppError('User not found', 404);
            res.json({ success: true, data: user });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map