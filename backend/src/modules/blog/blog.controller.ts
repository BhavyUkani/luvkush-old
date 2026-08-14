import { Request, Response, NextFunction } from 'express';
import { BlogService } from './blog.service';

export class BlogController {
  private service = new BlogService();

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 9, tag } = req.query;
      const result = await this.service.getAll(Number(page), Number(limit), tag as string);
      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  }

  async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const post = await this.service.getBySlug(req.params['slug']);
      res.json({ success: true, data: post });
    } catch (err) { next(err); }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await this.service.create(req.body, req.user!.userId);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.service.update(Number(req.params['id']), req.body);
      res.json({ success: true, message: 'Post updated' });
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.service.delete(Number(req.params['id']));
      res.json({ success: true, message: 'Post deleted' });
    } catch (err) { next(err); }
  }
}
