import { Request, Response, NextFunction } from 'express';
import { NewsletterService } from './newsletter.service';

export class NewsletterController {
  private service = new NewsletterService();

  async subscribe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const created = await this.service.subscribe(req.body.email, req.body.name);
      res.status(created ? 201 : 200).json({ success: true, message: 'Successfully subscribed to our newsletter!' });
    } catch (err) { next(err); }
  }

  async unsubscribe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.service.unsubscribe(req.body.email, req.body.token);
      res.json({ success: true, message: 'Successfully unsubscribed.' });
    } catch (err) { next(err); }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 50 } = req.query;
      const result = await this.service.getAll(Number(page), Number(limit));
      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  }
}
