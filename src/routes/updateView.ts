import express from 'express';
import UpdateView from '@/controllers/UpdateViewContronllers';

const router = express.Router();

router.post('/:movieType/:movieId', UpdateView.update);

export default router;
