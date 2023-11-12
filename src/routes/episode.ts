import express from 'express';
import Episode from '@/controllers/episodeController';

const router = express.Router();

router.get('/list/:movieId/:seasonId', Episode.getList);
router.get('/get/:movieId/:seasonId/:episodeNumber', Episode.get);

export default router;
