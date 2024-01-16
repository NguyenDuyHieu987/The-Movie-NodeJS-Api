import express from 'express';

import TV from '@/controllers/tv.controller';
import TvSlug from '@/controllers/tvSlug.controller';

const router = express.Router();

router.get('/detail/:id', TV.get);
router.get('/:slug', TvSlug.getSlug);
router.get('/discover/:slug', TvSlug.filter);

export default router;
