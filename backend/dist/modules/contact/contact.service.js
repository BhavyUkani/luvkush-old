"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const database_1 = require("../../utils/database");
const error_middleware_1 = require("../../middleware/error.middleware");
const email_service_1 = require("../../shared/email.service");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
class ContactService {
    emailService = new email_service_1.EmailService();
    async create(data, ipAddress, userAgent) {
        if (!data.name?.trim() || !data.email?.trim() || !data.message?.trim()) {
            throw new error_middleware_1.AppError('Name, email, and message are required', 400);
        }
        if (!EMAIL_RE.test(data.email.trim()))
            throw new error_middleware_1.AppError('A valid email is required', 400);
        await database_1.db.query(`
      INSERT INTO contact_queries (name, email, phone, subject, message, query_type, status, source, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, 'open', 'website', ?, ?)
    `, [
            data.name.trim(), data.email.toLowerCase().trim(), data.phone?.trim() || null,
            data.subject?.trim() || null, data.message.trim(), data.query_type || 'general',
            ipAddress, userAgent.slice(0, 500)
        ]);
        // Fire and forget.
        this.emailService.sendContactAcknowledgement(data.email, data.name).catch(() => { });
    }
    async getAll(page, limit, status) {
        const conditions = status ? ['status = ?'] : [];
        const params = status ? [status] : [];
        const sql = `SELECT * FROM contact_queries ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''} ORDER BY created_at DESC`;
        return database_1.db.paginate(sql, params, page, limit);
    }
    async updateStatus(id, status) {
        await database_1.db.query('UPDATE contact_queries SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);
    }
}
exports.ContactService = ContactService;
//# sourceMappingURL=contact.service.js.map