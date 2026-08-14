import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../../utils/database';
import { config } from '../../utils/config';
import { logger } from '../../utils/logger';
import { AppError } from '../../middleware/error.middleware';
import { EmailService } from '../../shared/email.service';

/** Parses jsonwebtoken-style duration strings ("15m", "8h", "30d") into
 * milliseconds. Falls back to 7 days for anything unrecognised. */
function parseDurationMs(duration: string): number {
  const match = /^(\d+)\s*(s|m|h|d)$/.exec(duration.trim());
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = Number(match[1]);
  const unitMs = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2] as 's' | 'm' | 'h' | 'd'];
  return value * unitMs;
}

/** Password-reset and email-verification tokens are single-use secrets
 * mailed to the user — store only a deterministic hash so read access to
 * the users table (a SQL injection elsewhere, a backup leak) can't be used
 * to take over accounts directly via the stored token. */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export class AuthService {
  private emailService = new EmailService();

  async register(data: {
    first_name: string;
    last_name?: string;
    email: string;
    password: string;
    phone?: string;
  }) {
    const existing = await db.queryOne('SELECT id FROM users WHERE email = ?', [data.email]);
    if (existing) throw new AppError('An account with this email already exists', 409);

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenHash = hashToken(verificationToken);

    let result: any;
    try {
      result = await db.query<any>(`
        INSERT INTO users (
          first_name, last_name, email, password_hash, phone,
          role, status, email_verification_token, created_at
        ) VALUES (?, ?, ?, ?, ?, 'customer', 'active', ?, NOW())
      `, [
        data.first_name, data.last_name || null, data.email,
        hashedPassword, data.phone || null, verificationTokenHash
      ]);
    } catch (err: any) {
      // Two concurrent signups with the same email both pass the earlier
      // SELECT check and race the UNIQUE constraint — convert that into the
      // same clean 409 a sequential duplicate would get.
      if (err?.code === 'ER_DUP_ENTRY') throw new AppError('An account with this email already exists', 409);
      throw err;
    }

    const userId = result.insertId;
    const tokens = this.generateTokens(userId, data.email, 'customer');

    // Store refresh token
    await this.storeRefreshToken(userId, tokens.refreshToken);

    // Send verification email (fire and forget)
    this.emailService.sendVerificationEmail(data.email, data.first_name, verificationToken)
      .catch(err => logger.error('Email error:', err));

    return {
      user: { id: userId, email: data.email, first_name: data.first_name, role: 'customer' },
      ...tokens
    };
  }

  async login(email: string, password: string) {
    const user = await db.queryOne<any>(
      'SELECT id, first_name, last_name, email, password_hash, role, status FROM users WHERE email = ?',
      [email]
    );

    if (!user) throw new AppError('Invalid email or password', 401);
    if (user.status !== 'active') throw new AppError('This account cannot sign in right now. Contact support.', 403);

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) throw new AppError('Invalid email or password', 401);

    const tokens = this.generateTokens(user.id, user.email, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    // Update last login
    await db.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

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

  async refreshToken(token: string) {
    let payload: any;
    try {
      payload = jwt.verify(token, config.jwt.refreshSecret);
    } catch {
      // Only a bad/expired token is the client's fault.
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // Anything past this point (DB errors, etc.) is an infrastructure
    // problem, not an invalid token — let it propagate as a 500 so it's
    // visible in logs instead of being reported to the user as "please log
    // in again" and masking a real outage.
    const stored = await db.queryOne(
      'SELECT * FROM refresh_tokens WHERE token = ? AND user_id = ? AND expires_at > NOW()',
      [token, payload.userId]
    );

    if (!stored) throw new AppError('Invalid or expired refresh token', 401);

    const user = await db.queryOne<any>(
      'SELECT id, email, role, status FROM users WHERE id = ?',
      [payload.userId]
    );

    if (!user || user.status !== 'active') throw new AppError('Invalid or expired refresh token', 401);

    const tokens = this.generateTokens(user.id, user.email, user.role);

    // Rotate refresh token
    await db.query('DELETE FROM refresh_tokens WHERE token = ?', [token]);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: number) {
    await db.query('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
  }

  async forgotPassword(email: string) {
    const user = await db.queryOne<any>(
      'SELECT id, first_name FROM users WHERE email = ? AND status != "suspended"',
      [email]
    );
    if (!user) return; // Don't reveal if email exists

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.query(
      'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?',
      [hashToken(token), expiresAt, user.id]
    );

    this.emailService.sendPasswordResetEmail(email, user.first_name, token)
      .catch(err => logger.error('Email error:', err));
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await db.queryOne<any>(
      'SELECT id FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW()',
      [hashToken(token)]
    );

    if (!user) throw new AppError('Invalid or expired reset token', 400);

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await db.query(
      'UPDATE users SET password_hash = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    // Invalidate all refresh tokens
    await db.query('DELETE FROM refresh_tokens WHERE user_id = ?', [user.id]);
  }

  async verifyEmail(token: string) {
    const user = await db.queryOne<any>(
      'SELECT id, status FROM users WHERE email_verification_token = ?',
      [hashToken(token)]
    );
    if (!user) throw new AppError('Invalid verification token', 400);

    // Confirming an email must never reactivate an account moderation has
    // suspended — only touch `status` when it isn't already suspended.
    if (user.status === 'suspended') {
      await db.query(
        'UPDATE users SET email_verified_at = NOW(), email_verification_token = NULL WHERE id = ?',
        [user.id]
      );
      return;
    }

    await db.query(
      'UPDATE users SET status = "active", email_verified_at = NOW(), email_verification_token = NULL WHERE id = ?',
      [user.id]
    );
  }

  async getUserById(userId: number) {
    return db.queryOne<any>(
      'SELECT id, first_name, last_name, email, phone, role, status, email_verified_at, created_at, last_login_at FROM users WHERE id = ?',
      [userId]
    );
  }

  private generateTokens(userId: number, email: string, role: string) {
    const accessToken = jwt.sign(
      { userId, email, role },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiresIn } as any
    );

    const refreshToken = jwt.sign(
      { userId, email, role },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn } as any
    );

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: number, token: string) {
    // Must track config.jwt.refreshExpiresIn exactly — a shorter hardcoded
    // DB lifetime than the JWT's own expiry means refresh fails from that
    // point on with a misleading "invalid or expired" error, even though
    // the token itself is still cryptographically valid.
    const expiresAt = new Date(Date.now() + parseDurationMs(config.jwt.refreshExpiresIn));
    await db.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );
  }
}
