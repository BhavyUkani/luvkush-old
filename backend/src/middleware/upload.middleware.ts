import multer, { FileFilterCallback } from 'multer';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import sharp from 'sharp';
import { config } from '../utils/config';
import { AppError } from './error.middleware';

const storage = multer.memoryStorage();

// A quick, cheap first pass — rejects obviously wrong uploads before the
// bytes are even fully read off the wire. This alone is NOT a security
// control: `file.mimetype` is just the client-declared multipart
// Content-Type, trivially spoofed by anyone sending the request directly
// (see verifyImageContent below for the check that actually matters).
const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (config.upload.allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`Invalid file type. Allowed: ${config.upload.allowedTypes.join(', ')}`, 400));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.upload.maxSize }
});

// Mimetype -> the format name sharp/libvips reports after actually decoding
// the bytes. Only formats reachable via config.upload.allowedTypes matter.
const MIME_TO_SHARP_FORMAT: Record<string, string> = {
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpeg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'heif'
};

/** Runs after multer has buffered the upload — decodes each file with sharp
 * (libvips) and checks the *actual* image format against the declared
 * mimetype, so a renamed .php/.html/.svg-with-script can't ride through on
 * a spoofed Content-Type the way file.mimetype alone would allow. */
const verifyImageContent = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const files: Express.Multer.File[] = req.file ? [req.file] : (req.files as Express.Multer.File[]) || [];
  try {
    for (const file of files) {
      const expectedFormat = MIME_TO_SHARP_FORMAT[file.mimetype];
      let metadata;
      try {
        metadata = await sharp(file.buffer).metadata();
      } catch {
        throw new AppError(`"${file.originalname}" is not a valid image file`, 400);
      }
      if (!expectedFormat || metadata.format !== expectedFormat) {
        throw new AppError(`"${file.originalname}" does not match its declared file type`, 400);
      }
    }
    next();
  } catch (err) {
    next(err);
  }
};

export const uploadMiddleware = (fieldName: string, maxCount: number = 1): RequestHandler[] => {
  return [upload.array(fieldName, maxCount), verifyImageContent];
};

export const uploadSingleMiddleware = (fieldName: string): RequestHandler[] => {
  return [upload.single(fieldName), verifyImageContent];
};
