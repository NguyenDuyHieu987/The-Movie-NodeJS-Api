import express from 'express';
import Rank from '@/controllers/ranksController';

const router = express.Router();

router.get('/hot-play/:type', Rank.hotPlay);
router.get('/hot-search/:type', Rank.hotSearch);
router.get('/high-rate/:type', Rank.highRate);
router.post('/add-play', Rank.addPlay);
router.post('/add-search', Rank.addSearch);
router.post('/add-rate', Rank.addRate);

export default router;
