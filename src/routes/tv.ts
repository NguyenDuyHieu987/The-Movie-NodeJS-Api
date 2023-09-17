import express from 'express';
import TV from '@/controllers/tvController';
import TvSlug from '@/controllers/tvSlugController';

const router = express.Router();

router.get('/detail/:id', TV.get);
router.get('/:slug', TvSlug.get);
router.get('/discover/:slug', TvSlug.filter);

export default router;
