import express from 'express';
import Ranking from '@/controllers/rankingController';

const router = express.Router();

router.get('/:slug', Ranking.get);

export default router;
