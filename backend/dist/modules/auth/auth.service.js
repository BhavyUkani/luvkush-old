"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
exports.parseDurationMs = parseDurationMs;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const database_1 = require("../../utils/database");
const config_1 = require("../../utils/config");
const logger_1 = require("../../utils/logger");
const error_middleware_1 = require("../../middleware/error.middleware");
const email_service_1 = require("../../shared/email.service");
/** Parses jsonwebtoken-style duration strings ("15m", "8h", "30d") into
 * milliseconds. Falls back to 7 days for anything unrecognised. */
function parseDurationMs(duration) {
    const match = /^(\d+)\s*(s|m|h|d)$/.exec(duration.trim());
    if (!match)
        return 7 * 24 * 60 * 60 * 1000;
    const value = Number(match[1]);
    const unitMs = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2]];
    return value * unitMs;
}
/** Password-reset and email-verification tokens are single-use secrets
 * mailed to the user — store only a deterministic hash so read access to
 * the users table (a SQL injection elsewhere, a backup leak) can't be used
 * to take over accounts directly via the stored token. */
function hashToken(token) {
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
}
class AuthService {
    emailService = new email_service_1.EmailService();
    async register(data) {
        const existing = await database_1.db.queryOne('SELECT id FROM users WHERE email = ?', [data.email]);
        if (existing)
            throw new error_middleware_1.AppError('An account with this email already exists', 409);
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 12);
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        const verificationTokenHash = hashToken(verificationToken);
        let result;
        try {
            result = await database_1.db.query(`
        INSERT INTO users (
          first_name, last_name, email, password_hash, phone,
          role, status, email_verification_token, created_at
        ) VALUES (?, ?, ?, ?, ?, 'customer', 'active', ?, NOW())
      `, [
                data.first_name, data.last_name || null, data.email,
                hashedPassword, data.phone || null, verificationTokenHash
            ]);
        }
        catch (err) {
            // Two concurrent signups with the same email both pass the earlier
            // SELECT check and race the UNIQUE constraint — convert that into the
            // same clean 409 a sequential duplicate would get.
            if (err?.code === 'ER_DUP_ENTRY')
                throw new error_middleware_1.AppError('An account with this email already exists', 409);
            throw err;
        }
        const userId = result.insertId;
        const tokens = this.generateTokens(userId, data.email, 'customer');
        // Store refresh token
        await this.storeRefreshToken(userId, tokens.refreshToken);
        // Send verification email (fire and forget)
        this.emailService.sendVerificationEmail(data.email, data.first_name, verificationToken)
            .catch(err => logger_1.logger.error('Email error:', err));
        return {
            user: { id: userId, email: data.email, first_name: data.first_name, role: 'customer' },
            ...tokens
        };
    }
    async login(email, password) {
        const user = await database_1.db.queryOne('SELECT id, first_name, last_name, email, password_hash, role, status FROM users WHERE email = ?', [email]);
        if (!user)
            throw new error_middleware_1.AppError('Invalid email or password', 401);
        if (user.status !== 'active')
            throw new error_middleware_1.AppError('This account cannot sign in right now. Contact support.', 403);
        const isValid = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isValid)
            throw new error_middleware_1.AppError('Invalid email or password', 401);
        const tokens = this.generateTokens(user.id, user.email, user.role);
        await this.storeRefreshToken(user.id, tokens.refreshToken);
        // Update last login
        await database_1.db.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);
        return {
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role
            },
            ...tokens
        };
    }
    async refreshToken(token) {
        let payload;
        try {
            payload = jsonwebtoken_1.default.verify(token, config_1.config.jwt.refreshSecret);
        }
        catch {
            // Only a bad/expired token is the client's fault.
            throw new error_middleware_1.AppError('Invalid or expired refresh token', 401);
        }
        // Anything past this point (DB errors, etc.) is an infrastructure
        // problem, not an invalid token — let it propagate as a 500 so it's
        // visible in logs instead of being reported to the user as "please log
        // in again" and masking a real outage.
        const stored = await database_1.db.queryOne('SELECT * FROM refresh_tokens WHERE token = ? AND user_id = ? AND expires_at > NOW()', [token, payload.userId]);
        if (!stored)
            throw new error_middleware_1.AppError('Invalid or expired refresh token', 401);
        const user = await database_1.db.queryOne('SELECT id, email, role, status FROM users WHERE id = ?', [payload.userId]);
        if (!user || user.status !== 'active')
            throw new error_middleware_1.AppError('Invalid or expired refresh token', 401);
        const tokens = this.generateTokens(user.id, user.email, user.role);
        // Rotate refresh token
        await database_1.db.query('DELETE FROM refresh_tokens WHERE token = ?', [token]);
        await this.storeRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }
    async logout(userId) {
        await database_1.db.query('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
    }
    async forgotPassword(email) {
        const user = await database_1.db.queryOne('SELECT id, first_name FROM users WHERE email = ? AND status != "suspended"', [email]);
        if (!user)
            return; // Don't reveal if email exists
        const token = crypto_1.default.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await database_1.db.query('UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?', [hashToken(token), expiresAt, user.id]);
        this.emailService.sendPasswordResetEmail(email, user.first_name, token)
            .catch(err => logger_1.logger.error('Email error:', err));
    }
    async resetPassword(token, newPassword) {
        const user = await database_1.db.queryOne('SELECT id FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW()', [hashToken(token)]);
        if (!user)
            throw new error_middleware_1.AppError('Invalid or expired reset token', 400);
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
        await database_1.db.query('UPDATE users SET password_hash = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?', [hashedPassword, user.id]);
        // Invalidate all refresh tokens
        await database_1.db.query('DELETE FROM refresh_tokens WHERE user_id = ?', [user.id]);
    }
    async verifyEmail(token) {
        const user = await database_1.db.queryOne('SELECT id, status FROM users WHERE email_verification_token = ?', [hashToken(token)]);
        if (!user)
            throw new error_middleware_1.AppError('Invalid verification token', 400);
        // Confirming an email must never reactivate an account moderation has
        // suspended — only touch `status` when it isn't already suspended.
        if (user.status === 'suspended') {
            await database_1.db.query('UPDATE users SET email_verified_at = NOW(), email_verification_token = NULL WHERE id = ?', [user.id]);
            return;
        }
        await database_1.db.query('UPDATE users SET status = "active", email_verified_at = NOW(), email_verification_token = NULL WHERE id = ?', [user.id]);
    }
    async getUserById(userId) {
        return database_1.db.queryOne('SELECT id, first_name, last_name, email, phone, role, status, email_verified_at, created_at, last_login_at FROM users WHERE id = ?', [userId]);
    }
    generateTokens(userId, email, role) {
        const accessToken = jsonwebtoken_1.default.sign({ userId, email, role }, config_1.config.jwt.accessSecret, { expiresIn: config_1.config.jwt.accessExpiresIn });
        const refreshToken = jsonwebtoken_1.default.sign({ userId, email, role }, config_1.config.jwt.refreshSecret, { expiresIn: config_1.config.jwt.refreshExpiresIn });
        return { accessToken, refreshToken };
    }
    async storeRefreshToken(userId, token) {
        // Must track config.jwt.refreshExpiresIn exactly — a shorter hardcoded
        // DB lifetime than the JWT's own expiry means refresh fails from that
        // point on with a misleading "invalid or expired" error, even though
        // the token itself is still cryptographically valid.
        const expiresAt = new Date(Date.now() + parseDurationMs(config_1.config.jwt.refreshExpiresIn));
        await database_1.db.query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [userId, token, expiresAt]);
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map