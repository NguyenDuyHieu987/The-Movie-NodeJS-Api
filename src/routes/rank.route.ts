import express from 'express';

import Rank from '@/controllers/ranks.controller';
import { authenticationHandler } from '@/middlewares';

const router = express.Router();

router.get('/hot-play/:sortBy', Rank.hotPlay);
router.get('/hot-search/:sortBy', Rank.hotSearch);
router.get('/high-rate/:sortBy', Rank.highRate);
router.get('/filter/:type/:sortBy', Rank.filter);
router.post('/add-play', Rank.addPlay);
router.post('/add-search', Rank.addSearch);
router.post(
  '/add-rate',
  (...params) => authenticationHandler(...params, { required: true }),
  Rank.addRate
);

export default router;
