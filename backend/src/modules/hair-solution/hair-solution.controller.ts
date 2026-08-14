import { Request, Response, NextFunction } from 'express';
import { HairSolutionService } from './hair-solution.service';

export class HairSolutionController {
  private service = new HairSolutionService();

  async getFeatured(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const solutions = await this.service.getFeatured();
      res.json({ success: true, data: solutions });
    } catch (err) { next(err); }
  }

  async getWigs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const wigs = await this.service.getWigs(req.query['gender'] as string);
      res.json({ success: true, data: wigs });
    } catch (err) { next(err); }
  }

  async getPatches(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const patches = await this.service.getPatches();
      res.json({ success: true, data: patches });
    } catch (err) { next(err); }
  }

  async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await this.service.getBySlug(req.params['slug']);
      if (!item) { res.status(404).json({ success: false, message: 'Not found' }); return; }
      res.json({ success: true, data: item });
    } catch (err) { next(err); }
  }
}
