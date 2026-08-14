import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { AppError } from '../../middleware/error.middleware';
import { logActivity } from '../../utils/activity-logger';
import { setAuthCookies, clearAuthCookies } from './auth-cookies';

export class AuthController {
  private service = new AuthService();

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { first_name, last_name, email, password, phone } = req.body;

      const { user, accessToken, refreshToken } = await this.service.register({ first_name, last_name, email, password, phone });
      setAuthCookies(res, accessToken, refreshToken);
      res.status(201).json({ success: true, data: { user }, message: 'Account created.' });
    } catch (err) { next(err); }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const { user, accessToken, refreshToken } = await this.service.login(email, password);
      if (user.role === 'admin' || user.role === 'super_admin') {
        logActivity({ action: 'admin_login', userId: user.id, module: 'auth', newValues: { email: user.email, role: user.role } });
      }
      setAuthCookies(res, accessToken, refreshToken);
      res.json({ success: true, data: { user } });
    } catch (err) { next(err); }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.['lk_refresh_token'];
      if (!refreshToken) throw new AppError('Not authenticated', 401);

      const { accessToken, refreshToken: newRefresh } = await this.service.refreshToken(refreshToken);
      setAuthCookies(res, accessToken, newRefresh);
      res.json({ success: true });
    } catch (err) { next(err); }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.service.logout(req.user!.userId);
      clearAuthCookies(res);
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      await this.service.forgotPassword(email);
      res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = req.body;

      await this.service.resetPassword(token, password);
      res.json({ success: true, message: 'Password reset successfully. Please login.' });
    } catch (err) {
      next(err);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body;
      if (!token) throw new AppError('Verification token required', 400);

      await this.service.verifyEmail(token);
      res.json({ success: true, message: 'Email verified successfully!' });
    } catch (err) {
      next(err);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await this.service.getUserById(req.user!.userId);
      if (!user) throw new AppError('User not found', 404);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }
}
