import express from 'express';
const router = express.Router();

const trendingController = require('../app/controllers/TrendingController');

// router.get('/search', siteController.search);
router.get('/:slug', trendingController.index);

export default router;
