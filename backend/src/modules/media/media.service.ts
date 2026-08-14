import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../../utils/config';
import { AppError } from '../../middleware/error.middleware';

export class MediaService {
  /** Sanitizes the requested folder and resolves it against the upload root,
   * rejecting anything that would escape it (no `..`, no slashes, no
   * absolute paths). */
  private resolveUploadDir(requestedFolder: string): { folder: string; uploadDir: string } {
    const folder = path.basename(requestedFolder || 'general').replace(/[^a-zA-Z0-9_-]/g, '') || 'general';
    const uploadRoot = path.resolve(config.upload.dir);
    const uploadDir = path.resolve(uploadRoot, folder);
    if (uploadDir !== uploadRoot && !uploadDir.startsWith(uploadRoot + path.sep)) {
      throw new AppError('Invalid folder', 400);
    }
    return { folder, uploadDir };
  }

  async uploadFiles(files: Express.Multer.File[], requestedFolder: string): Promise<string[]> {
    if (!files?.length) throw new AppError('No files uploaded', 400);

    const { folder, uploadDir } = this.resolveUploadDir(requestedFolder);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uploaded: string[] = [];
    for (const file of files) {
      const filename = `${uuidv4()}.webp`;
      const outputPath = path.join(uploadDir, filename);

      await sharp(file.buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(outputPath);

      uploaded.push(`/uploads/${folder}/${filename}`);
    }

    return uploaded;
  }
}
