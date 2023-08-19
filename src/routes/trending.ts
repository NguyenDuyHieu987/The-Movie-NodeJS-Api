import express from 'express';
import trending from '@/controllers/trendingController';

const router = express.Router();

router.get('/:slug', trending.get);

export default router;
