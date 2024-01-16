import express from 'express';

import UpdateView from '@/controllers/updateView.contronllers';

const router = express.Router();

router.post('/:movieType/:movieId', UpdateView.update);

export default router;
