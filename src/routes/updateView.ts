import UpdateView from '@/controllers/updateViewContronllers';
import express from 'express';

const router = express.Router();

router.post('/:movieType/:movieId', UpdateView.update);

export default router;
