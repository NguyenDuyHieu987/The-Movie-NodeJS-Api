import express from 'express';
import trendingController from '../controllers/TrendingController';

const router = express.Router();

// router.get('/search', siteController.search);
router.get('/:slug', trendingController.index);

export default router;
