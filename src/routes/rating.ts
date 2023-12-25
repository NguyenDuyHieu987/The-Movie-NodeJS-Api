import Rate from '@/controllers/ratingController';
import express from 'express';
const router = express.Router();

router.get('/get/:movieType/:movieId', Rate.get);
router.post('/:movieType/:movieId', Rate.rate);

export default router;
