import { Router } from 'express';
import { MediaController } from './media.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { uploadMiddleware } from '../../middleware/upload.middleware';

const router = Router();
const ctrl = new MediaController();

router.post('/upload', authenticate, authorize('super_admin', 'admin'), uploadMiddleware('files', 10), ctrl.upload.bind(ctrl));

export default router;
