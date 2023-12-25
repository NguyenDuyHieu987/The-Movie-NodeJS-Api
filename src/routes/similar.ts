import express from 'express';

import Similar from '@/controllers/similarController';

const router = express.Router();

router.get('/:type/:movieId', Similar.get);

export default router;
