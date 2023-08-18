import express from 'express';
import TV from '@/controllers/TVController';
import TvSlug from '@/controllers/tvSlugController';

const router = express.Router();

router.get('/detail/:id', TV.get);
router.get('/:slug', TvSlug.get);

export default router;
