import express from 'express';

import Season from '@/controllers/seasonController';

const router = express.Router();

router.get('/list/:seriesId', Season.getList);
router.get('/get/:movieId/:seasonId', Season.get);

export default router;
