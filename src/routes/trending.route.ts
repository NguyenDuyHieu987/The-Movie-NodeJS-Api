import express from 'express';

import Trending from '@/controllers/trending.controller';

const router = express.Router();

router.get('/test', Trending.test);
router.get('/:slug', Trending.getSlug);

export default router;
