import { Router } from 'express';
import { SeoController } from './seo.controller';

const router = Router();
const ctrl = new SeoController();

// Returns SEO metadata for a given path (used by SSR)
router.get('/meta', ctrl.getMeta.bind(ctrl));

export default router;
