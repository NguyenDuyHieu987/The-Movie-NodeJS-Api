import express from 'express';

import Similar from '@/controllers/similarController';

const router = express.Router();

router.get('/:type/:movieId', Similar.getSlug);

export default router;
