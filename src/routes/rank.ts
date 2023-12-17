import express from 'express';
import Rank from '@/controllers/ranksController';

const router = express.Router();

router.get('/hot-play', Rank.hotPlay);
router.get('/hot-search', Rank.hotSearch);
router.post('/add-play', Rank.addPlay);
router.post('/add-search', Rank.addSearch);
router.get('/:slug', Rank.get);

export default router;
