import { Request, Response, NextFunction } from 'express';
import { MediaService } from './media.service';

export class MediaController {
  private service = new MediaService();

  async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];
      const urls = await this.service.uploadFiles(files, req.body['folder']);
      res.json({ success: true, data: { urls } });
    } catch (err) { next(err); }
  }
}
