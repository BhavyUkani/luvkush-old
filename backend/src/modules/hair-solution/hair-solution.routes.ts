import { Router } from 'express';
import { HairSolutionController } from './hair-solution.controller';

const router = Router();
const ctrl = new HairSolutionController();

router.get('/', ctrl.getFeatured.bind(ctrl));
router.get('/wigs', ctrl.getWigs.bind(ctrl));
router.get('/patches', ctrl.getPatches.bind(ctrl));
router.get('/:slug', ctrl.getBySlug.bind(ctrl));

export default router;
