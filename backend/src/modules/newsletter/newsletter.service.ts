import crypto from 'crypto';
import { db } from '../../utils/database';
import { AppError } from '../../middleware/error.middleware';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class NewsletterService {
  /** Returns true when a brand-new subscriber row was created (vs. an
   * existing one being reactivated), so the controller can pick 201 vs 200. */
  async subscribe(rawEmail: string, name?: string): Promise<boolean> {
    const email = (rawEmail || '').trim().toLowerCase();
    if (!email || !EMAIL_RE.test(email)) throw new AppError('A valid email is required', 400);

    const existing = await db.queryOne<any>('SELECT id, status FROM newsletter_subscribers WHERE email = ?', [email]);
    if (existing) {
      if (existing.status !== 'active') {
        await db.query("UPDATE newsletter_subscribers SET status = 'active', subscribed_at = NOW() WHERE email = ?", [email]);
      }
      return false;
    }

    const unsubscribeToken = crypto.randomBytes(24).toString('hex');
    await db.query(
      "INSERT INTO newsletter_subscribers (email, unsubscribe_token, name, status, source) VALUES (?, ?, ?, 'active', 'website')",
      [email, unsubscribeToken, name?.trim() || null]
    );
    return true;
  }

  async unsubscribe(rawEmail: string, token: string) {
    const email = (rawEmail || '').trim().toLowerCase();
    if (!email || !token) throw new AppError('Email and unsubscribe token are required', 400);

    // Requiring the per-subscriber token (sent in the newsletter email's
    // unsubscribe link) instead of a bare email address prevents anyone
    // from mass-unsubscribing the list by iterating known addresses.
    const result = await db.query<any>(
      "UPDATE newsletter_subscribers SET status = 'unsubscribed', unsubscribed_at = NOW() WHERE email = ? AND unsubscribe_token = ?",
      [email, token]
    );
    if (result.affectedRows === 0) throw new AppError('Invalid unsubscribe link', 400);
  }

  async getAll(page: number, limit: number) {
    const sql = "SELECT id, email, name, status, subscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC";
    return db.paginate(sql, [], page, limit);
  }
}
