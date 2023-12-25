import Episode from '@/controllers/episodeController';
import express from 'express';

const router = express.Router();

router.get('/list/:movieId/:seasonId', Episode.getList);
router.get('/get/:movieId/:seasonId/:episodeNumber', Episode.get);

export default router;
