import { db } from '../../utils/database';
import { AppError } from '../../middleware/error.middleware';
import { EmailService } from '../../shared/email.service';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class ContactService {
  private emailService = new EmailService();

  async create(data: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
    query_type?: string;
  }, ipAddress: string | null, userAgent: string) {
    if (!data.name?.trim() || !data.email?.trim() || !data.message?.trim()) {
      throw new AppError('Name, email, and message are required', 400);
    }
    if (!EMAIL_RE.test(data.email.trim())) throw new AppError('A valid email is required', 400);

    await db.query(`
      INSERT INTO contact_queries (name, email, phone, subject, message, query_type, status, source, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, 'open', 'website', ?, ?)
    `, [
      data.name.trim(), data.email.toLowerCase().trim(), data.phone?.trim() || null,
      data.subject?.trim() || null, data.message.trim(), data.query_type || 'general',
      ipAddress, userAgent.slice(0, 500)
    ]);

    // Fire and forget.
    this.emailService.sendContactAcknowledgement(data.email, data.name).catch(() => {});
  }

  async getAll(page: number, limit: number, status?: string) {
    const conditions = status ? ['status = ?'] : [];
    const params = status ? [status] : [];
    const sql = `SELECT * FROM contact_queries ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''} ORDER BY created_at DESC`;
    return db.paginate(sql, params, page, limit);
  }

  async updateStatus(id: number, status: string) {
    await db.query('UPDATE contact_queries SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);
  }
}
