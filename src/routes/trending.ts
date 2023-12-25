import express from 'express';

import Trending from '@/controllers/trendingController';

const router = express.Router();

router.get('/test', Trending.test);
router.get('/:slug', Trending.get);

export default router;
