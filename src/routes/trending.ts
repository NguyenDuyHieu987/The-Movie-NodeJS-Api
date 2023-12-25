import Trending from '@/controllers/trendingController';
import express from 'express';

const router = express.Router();

router.get('/test', Trending.test);
router.get('/:slug', Trending.get);

export default router;
