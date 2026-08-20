"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsletterService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const database_1 = require("../../utils/database");
const error_middleware_1 = require("../../middleware/error.middleware");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
class NewsletterService {
    /** Returns true when a brand-new subscriber row was created (vs. an
     * existing one being reactivated), so the controller can pick 201 vs 200. */
    async subscribe(rawEmail, name) {
        const email = (rawEmail || '').trim().toLowerCase();
        if (!email || !EMAIL_RE.test(email))
            throw new error_middleware_1.AppError('A valid email is required', 400);
        const existing = await database_1.db.queryOne('SELECT id, status FROM newsletter_subscribers WHERE email = ?', [email]);
        if (existing) {
            if (existing.status !== 'active') {
                await database_1.db.query("UPDATE newsletter_subscribers SET status = 'active', subscribed_at = NOW() WHERE email = ?", [email]);
            }
            return false;
        }
        const unsubscribeToken = crypto_1.default.randomBytes(24).toString('hex');
        await database_1.db.query("INSERT INTO newsletter_subscribers (email, unsubscribe_token, name, status, source) VALUES (?, ?, ?, 'active', 'website')", [email, unsubscribeToken, name?.trim() || null]);
        return true;
    }
    async unsubscribe(rawEmail, token) {
        const email = (rawEmail || '').trim().toLowerCase();
        if (!email || !token)
            throw new error_middleware_1.AppError('Email and unsubscribe token are required', 400);
        // Requiring the per-subscriber token (sent in the newsletter email's
        // unsubscribe link) instead of a bare email address prevents anyone
        // from mass-unsubscribing the list by iterating known addresses.
        const result = await database_1.db.query("UPDATE newsletter_subscribers SET status = 'unsubscribed', unsubscribed_at = NOW() WHERE email = ? AND unsubscribe_token = ?", [email, token]);
        if (result.affectedRows === 0)
            throw new error_middleware_1.AppError('Invalid unsubscribe link', 400);
    }
    async getAll(page, limit) {
        const sql = "SELECT id, email, name, status, subscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC";
        return database_1.db.paginate(sql, [], page, limit);
    }
}
exports.NewsletterService = NewsletterService;
//# sourceMappingURL=newsletter.service.js.map