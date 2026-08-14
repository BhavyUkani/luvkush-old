import { Request, Response, NextFunction } from 'express';
import { ContactService } from './contact.service';

export class ContactController {
  private service = new ContactService();

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.service.create(req.body, req.ip || null, (req.headers['user-agent'] || '') as string);
      res.status(201).json({ success: true, message: 'Your message has been received. We will get back to you within 24 hours.' });
    } catch (err) { next(err); }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const result = await this.service.getAll(Number(page), Number(limit), status as string);
      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.service.updateStatus(Number(req.params['id']), req.body['status']);
      res.json({ success: true, message: 'Status updated' });
    } catch (err) { next(err); }
  }
}
