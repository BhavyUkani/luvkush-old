import { Request, Response, NextFunction } from 'express';
import { SeoService } from './seo.service';

export class SeoController {
  private service = new SeoService();

  async getMeta(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { path: urlPath } = req.query;
      if (!urlPath) { res.json({ success: true, data: null }); return; }
      const meta = await this.service.getMetaForPath(String(urlPath));
      res.json({ success: true, data: meta });
    } catch (err) { next(err); }
  }
}
